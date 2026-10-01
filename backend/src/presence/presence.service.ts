import { Injectable } from '@nestjs/common';

import { FriendsService } from '../friends/friends.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PresenceService {
  private readonly onlineUsers = new Map<number, Set<string>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly friendsService: FriendsService,
  ) {}

  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  addConnection(userId: number, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.add(socketId);
      return false;
    }
    this.onlineUsers.set(userId, new Set([socketId]));
    return true;
  }

  removeConnection(userId: number, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return false;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      return true;
    }
    return false;
  }

  async markOffline(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeenAt: new Date() },
    });
  }

  async getFriendsPresence(userId: number) {
    const friendIds = await this.friendsService.getFriendIds(userId);
    const offlineIds = friendIds.filter((id) => !this.isOnline(id));
    const users = offlineIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: offlineIds } },
          select: { id: true, lastSeenAt: true },
        })
      : [];
    const lastSeenMap = new Map(users.map((u) => [u.id, u.lastSeenAt]));

    return friendIds.map((id) => ({
      userId: id,
      online: this.isOnline(id),
      lastSeenAt: this.isOnline(id) ? null : (lastSeenMap.get(id) ?? null),
    }));
  }
}
