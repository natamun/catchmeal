import { ConflictException, Injectable } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { GdprService } from '../gdpr/gdpr.service';
import { PresenceService } from '../presence/presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
    private readonly gdprService: GdprService,
  ) {}

  async getUsers() {
    const [users, hashFlags] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createAt: true,
          deletedAt: true,
          oauthProvider: true,
          _count: {
            select: {
              userFriend: { where: { status: 'ACCEPTED' } },
            },
          },
        },
        orderBy: { createAt: 'desc' },
      }),
      this.prisma.$queryRaw<
        { id: number; hasPassword: boolean }[]
      >`SELECT id, "passwordHash" <> '' AS "hasPassword" FROM "User"`,
    ]);
    const hasPasswordById = new Map(
      hashFlags.map((f) => [f.id, f.hasPassword]),
    );
    return users.map((u) => ({
      ...u,
      hasPassword: hasPasswordById.get(u.id) ?? false,
      onlineStatus: this.presenceService.isOnline(u.id),
    }));
  }

  async getUserById(userId: number) {
    const [user, hashFlag] = await Promise.all([
      this.prisma.user.findUnique({
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
          oauthProvider: true,
          _count: {
            select: {
              userFriend: { where: { status: 'ACCEPTED' } },
            },
          },
        },
      }),
      this.prisma.$queryRaw<
        { hasPassword: boolean }[]
      >`SELECT "passwordHash" <> '' AS "hasPassword" FROM "User" WHERE id = ${userId}`,
    ]);
    if (!user) return null;
    return {
      ...user,
      hasPassword: hashFlag[0]?.hasPassword ?? false,
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
    // Same full erasure as self-deletion, but without the confirmation email
    return this.gdprService.deleteAccount(userId, false);
  }

  async updateUser(userId: number, dto: UpdateAdminUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: { id: true, username: true, role: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException("Ce nom d'utilisateur est déjà pris");
      }
      throw error;
    }
  }
}
