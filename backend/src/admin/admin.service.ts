import { Injectable } from '@nestjs/common';

import { PresenceService } from '../presence/presence.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
  ) {}

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createAt: true,
        deletedAt: true,
        passwordHash: true,
        _count: {
          select: {
            userFriend: { where: { status: 'ACCEPTED' } },
          },
        },
      },
      orderBy: { createAt: 'desc' },
    });
    return users.map((u) => {
      const { passwordHash, ...rest } = u;
      return {
        ...rest,
        hasPassword: passwordHash !== '',
        onlineStatus: this.presenceService.isOnline(u.id),
      };
    });
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createAt: true,
        deletedAt: true,
        lastSeenAt: true,
        passwordHash: true,
        _count: {
          select: {
            userFriend: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      hasPassword: passwordHash !== '',
      onlineStatus: this.presenceService.isOnline(userId),
    };
  }

  async getStats() {
    const [totalUsers, totalMeals, totalFoodItems] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.meal.count(),
      this.prisma.foodItem.count(),
    ]);

    return { totalUsers, totalMeals, totalFoodItems };
  }

  async deleteUser(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: { id: true, username: true, deletedAt: true },
    });
  }

  async updateUserRole(userId: number, role: 'USER' | 'ADMIN') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
  }
}
