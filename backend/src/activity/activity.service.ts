import { Injectable } from '@nestjs/common';

import { FriendsService } from '../friends/friends.service';
import { Prisma } from '../generated/prisma/client';
import { ActivityType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from './activity.gateway';

const STREAK_MILESTONES = [7, 30];
const SAFE_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

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
    case ActivityType.WEIGHT_GOAL_REACHED: {
      const target = (metadata as { targetWeight?: number } | null)
        ?.targetWeight;
      return `a atteint son poids cible${target ? ` (${target} kg)` : ''}`;
    }
    case ActivityType.STREAK_REACHED: {
      const days = (metadata as { days?: number } | null)?.days;
      return `a atteint son objectif calorique ${days ? `${days} jours de suite` : 'plusieurs jours de suite'}`;
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
    user: {
      id: number;
      username: string;
      name: string;
      avatarUrl: string | null;
    };
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

  async recordGoalReached(userId: number, day: string) {
    const alreadyRecorded = await this.prisma.activity.findFirst({
      where: {
        userId,
        type: ActivityType.GOAL_REACHED,
        metadata: { path: ['day'], equals: day },
      },
      select: { id: true },
    });
    if (alreadyRecorded) return;

    await this.record(userId, ActivityType.GOAL_REACHED, { day });

    const streak = await this.getGoalReachedStreak(userId, day);
    if (STREAK_MILESTONES.includes(streak)) {
      await this.record(userId, ActivityType.STREAK_REACHED, { days: streak });
    }
  }

  private async getGoalReachedStreak(userId: number, day: string) {
    const rows = await this.prisma.activity.findMany({
      where: { userId, type: ActivityType.GOAL_REACHED },
      orderBy: { createdAt: 'desc' },
      take: Math.max(...STREAK_MILESTONES) + 1,
      select: { metadata: true },
    });
    const days = new Set(
      rows.map((row) => (row.metadata as { day?: string } | null)?.day),
    );

    let streak = 0;
    const cursor = new Date(`${day}T00:00:00.000Z`);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }

  async getFriendsFeed(userId: number) {
    const friendIds = await this.friendsService.getFriendIds(userId);
    if (friendIds.length === 0) return [];

    const activities = await this.prisma.activity.findMany({
      where: { userId: { in: friendIds }, user: { deletedAt: null } },
      include: { user: { select: SAFE_USER_SELECT } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return activities.map((activity) => this.toFeedItem(activity));
  }

  async removeByWeightLog(userId: number, weightLogId: number) {
    const activities = await this.prisma.activity.findMany({
      where: {
        userId,
        metadata: { path: ['weightLogId'], equals: weightLogId },
      },
      select: { id: true },
    });
    if (activities.length === 0) return;

    const ids = activities.map((activity) => activity.id);
    await this.prisma.activity.deleteMany({ where: { id: { in: ids } } });

    const friendIds = await this.friendsService.getFriendIds(userId);
    friendIds.forEach((friendId) => {
      ids.forEach((id) => {
        this.activityGateway.server
          .to(`user:${friendId}`)
          .emit('activity:removed', { id });
      });
    });
  }

  async updateWeightActivity(
    userId: number,
    weightLogId: number,
    weight: number,
  ) {
    const activity = await this.prisma.activity.findFirst({
      where: {
        userId,
        type: ActivityType.WEIGHT_LOGGED,
        metadata: { path: ['weightLogId'], equals: weightLogId },
      },
      select: { id: true },
    });
    if (!activity) return;

    const updated = await this.prisma.activity.update({
      where: { id: activity.id },
      data: { metadata: { weight, weightLogId } },
      include: { user: { select: SAFE_USER_SELECT } },
    });

    const item = this.toFeedItem(updated);
    const friendIds = await this.friendsService.getFriendIds(userId);
    friendIds.forEach((friendId) => {
      this.activityGateway.server
        .to(`user:${friendId}`)
        .emit('activity:updated', item);
    });
  }
}
