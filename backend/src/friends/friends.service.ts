import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(userId: number, friendId: number) {
    if (userId === friendId) {
      throw new BadRequestException(
        'Impossible de se demander soi-même en ami',
      );
    }

    const existing = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new ConflictException('Déjà ami avec cet utilisateur');
      }
      if (existing.userId === userId) {
        throw new ConflictException('Demande déjà envoyée à cet utilisateur');
      }
      throw new ConflictException(
        'Cet utilisateur vous a déjà envoyé une demande',
      );
    }

    try {
      return await this.prisma.friend.create({
        data: { userId, friendId, status: 'PENDING' },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Déjà ami avec cet utilisateur');
      }
      throw error;
    }
  }

  async acceptRequest(userId: number, id: number) {
    await this.prisma.friend.findFirstOrThrow({
      where: { id, friendId: userId, status: 'PENDING' },
    });

    return this.prisma.friend.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });
  }

  async removeOrDecline(userId: number, id: number) {
    const friendship = await this.prisma.friend.findFirst({
      where: { id, OR: [{ userId }, { friendId: userId }] },
    });
    if (!friendship) {
      throw new NotFoundException();
    }

    return this.prisma.friend.delete({ where: { id } });
  }

  async getFriendsActivity(userId: number) {
    const rows = await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: SAFE_USER_SELECT },
        friendUser: { select: SAFE_USER_SELECT },
      },
      take: 50,
    });

    const results = await Promise.all(
      rows.map(async (row) => {
        const friend = row.userId === userId ? row.friendUser : row.user;

        const [meal, weight] = await Promise.all([
          this.prisma.meal.findFirst({
            where: { userId: friend.id, loggedAt: { not: null } },
            orderBy: { loggedAt: 'desc' },
            select: { loggedAt: true, typeMeal: true },
          }),
          this.prisma.weightLog.findFirst({
            where: { userId: friend.id },
            orderBy: { loggedAt: 'desc' },
            select: { loggedAt: true, weight: true },
          }),
        ]);

        let lastAction: string | null = null;
        let lastActionAt: string | null = null;

        if (meal && (!weight || meal.loggedAt! >= weight.loggedAt)) {
          const label = meal.typeMeal ?? 'repas';
          lastAction = `a enregistré un ${label.toLowerCase()}`;
          lastActionAt = meal.loggedAt!.toISOString();
        } else if (weight) {
          lastAction = `a enregistré son poids (${weight.weight} kg)`;
          lastActionAt = weight.loggedAt.toISOString();
        }

        return {
          friendshipId: row.id,
          friend: {
            id: friend.id,
            username: friend.username,
            name: friend.name,
            avatarUrl: friend.avatarUrl,
          },
          lastAction,
          lastActionAt,
        };
      }),
    );

    return results.sort((a, b) => {
      if (!a.lastActionAt) return 1;
      if (!b.lastActionAt) return -1;
      return b.lastActionAt.localeCompare(a.lastActionAt);
    });
  }

  async listFriends(userId: number) {
    const rows = await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: SAFE_USER_SELECT },
        friendUser: { select: SAFE_USER_SELECT },
      },
    });

    return rows.map((row) => ({
      friendshipId: row.id,
      friend: row.userId === userId ? row.friendUser : row.user,
    }));
  }

  async listPendingReceived(userId: number) {
    const rows = await this.prisma.friend.findMany({
      where: { friendId: userId, status: 'PENDING' },
      include: { user: { select: SAFE_USER_SELECT } },
    });

    return rows.map((row) => ({
      requestId: row.id,
      from: row.user,
    }));
  }

  async listPendingSent(userId: number) {
    const rows = await this.prisma.friend.findMany({
      where: { userId, status: 'PENDING' },
      select: { friendId: true },
    });
    return rows.map((row) => row.friendId);
  }

  async getFriendIds(userId: number): Promise<number[]> {
    const rows = await this.prisma.friend.findMany({
      where: { status: 'ACCEPTED', OR: [{ userId }, { friendId: userId }] },
    });
    return rows.map((row) =>
      row.userId === userId ? row.friendId : row.userId,
    );
  }
}
