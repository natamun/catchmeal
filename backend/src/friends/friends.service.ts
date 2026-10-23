import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsGateway } from './friends.gateway';

const SAFE_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} as const;

// Friends list also exposes deletedAt so the UI can flag deleted accounts
const FRIEND_SELECT = {
  ...SAFE_USER_SELECT,
  deletedAt: true,
} as const;

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friendsGateway: FriendsGateway,
  ) {}

  async sendRequest(userId: number, friendId: number) {
    if (userId === friendId) {
      throw new BadRequestException(
        'Impossible de se demander soi-même en ami',
      );
    }

    try {
      const request = await this.prisma.$transaction(async (tx) => {
        // Lock the pair of users until the end of the transaction: A→B and
        // B→A sent at the same time must not both pass the check below.
        const [low, high] =
          userId < friendId ? [userId, friendId] : [friendId, userId];
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${low}, ${high})`;

        const existing = await tx.friend.findFirst({
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
            throw new ConflictException(
              'Demande déjà envoyée à cet utilisateur',
            );
          }
          throw new ConflictException(
            'Cet utilisateur vous a déjà envoyé une demande',
          );
        }

        return tx.friend.create({
          data: { userId, friendId, status: 'PENDING' },
          include: { user: { select: SAFE_USER_SELECT } },
        });
      });

      this.friendsGateway.notifyRequestReceived(friendId, {
        requestId: request.id,
        from: request.user,
      });
      return request;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Demande déjà envoyée à cet utilisateur');
      }
      throw error;
    }
  }

  async acceptRequest(userId: number, id: number) {
    // One statement checks that the request is still pending and accepts it:
    // two clicks, or an accept during a cancel, cannot both succeed.
    const friendship = await this.prisma.friend.update({
      where: { id, friendId: userId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
      include: { friendUser: { select: SAFE_USER_SELECT } },
    });
    this.friendsGateway.notifyRequestAccepted(friendship.userId, {
      friendshipId: friendship.id,
      friend: friendship.friendUser,
    });
    return friendship;
  }

  async removeOrDecline(userId: number, id: number) {
    const friendship = await this.prisma.friend.findFirst({
      where: { id, OR: [{ userId }, { friendId: userId }] },
    });
    if (!friendship) {
      throw new NotFoundException();
    }

    const removed = await this.prisma.friend.delete({ where: { id } });
    const otherUserId =
      friendship.userId === userId ? friendship.friendId : friendship.userId;
    this.friendsGateway.notifyFriendshipRemoved(otherUserId, {
      friendshipId: id,
    });
    return removed;
  }

  async listFriends(userId: number) {
    const rows = await this.prisma.friend.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: FRIEND_SELECT },
        friendUser: { select: FRIEND_SELECT },
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
