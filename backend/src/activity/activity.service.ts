import { Injectable } from '@nestjs/common';

import { FriendsService } from '../friends/friends.service';
import { Prisma } from '../generated/prisma/client';
import { ActivityType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from './activity.gateway';

const SAFE_USER_SELECT = { id: true, username: true, name: true } as const;

function formatMessage(type: ActivityType, metadata: Prisma.JsonValue): string {
  switch (type) {
    case ActivityType.MEAL_LOGGED: {
      const { name, kcal } = metadata as { name?: string; kcal?: number };
      const label = name ? `[${name}]` : 'un repas';
      return `a enregistré ${label}${kcal ? ` (${kcal} kcal)` : ''}`;
    }
    case ActivityType.WEIGHT_LOGGED: {
      const weight = (metadata as { weight?: number })?.weight;
      return `a enregistré son poids${weight ? ` (${weight} kg)` : ''}`;
    }
    case ActivityType.GOAL_REACHED:
      return 'a atteint son objectif calorique du jour';
    case ActivityType.CALORIE_GOAL_CHANGED: {
      const goal = (metadata as { goal?: number })?.goal;
      return `a changé son objectif calorique${goal ? ` (${goal} kcal)` : ''}`;
    }
  }
}

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friendsService: FriendsService,
    private readonly activityGateway: ActivityGateway,
  ) {}

  toFeedItem(activity: {
    id: number;
    type: ActivityType;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    user: { id: number; username: string; name: string };
  }) {
    return {
      id: activity.id,
      type: activity.type,
      message: formatMessage(activity.type, activity.metadata),
      createdAt: activity.createdAt,
      user: activity.user,
    };
  }

  async record(
    userId: number,
    type: ActivityType,
    metadata?: Prisma.InputJsonValue,
  ) {
    const activity = await this.prisma.activity.create({
      data: { userId, type, metadata },
      include: { user: { select: SAFE_USER_SELECT } },
    });

    const item = this.toFeedItem(activity);
    const friendIds = await this.friendsService.getFriendIds(userId);
    friendIds.forEach((friendId) => {
      this.activityGateway.server
        .to(`user:${friendId}`)
        .emit('activity:new', item);
    });

    return activity;
  }

  async getFriendsFeed(userId: number) {
    const friendIds = await this.friendsService.getFriendIds(userId);
    if (friendIds.length === 0) return [];

    const activities = await this.prisma.activity.findMany({
      where: { userId: { in: friendIds } },
      include: { user: { select: SAFE_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return activities.map((activity) => this.toFeedItem(activity));
  }
}
