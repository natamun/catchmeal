import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createAt: true,
        deletedAt: true,
      },
      orderBy: { createAt: 'desc' },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
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
        _count: {
          select: {
            userFriend: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });
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
