import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiContextService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        height: true,
        gender: true,
        birthDate: true,
        activityLevel: true,
        targetWeight: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbsGoal: true,
        dailyFatGoal: true,
        weightLogs: {
          orderBy: { loggedAt: 'desc' },
          take: 1,
          select: { weight: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const { weightLogs, ...profile } = user;

    return {
      profile: {
        height: profile.height,
        gender: profile.gender,
        birthDate: profile.birthDate,
        activityLevel: profile.activityLevel,
      },
      goals: {
        targetWeight: profile.targetWeight,
        dailyCalorieGoal: profile.dailyCalorieGoal,
        dailyProteinGoal: profile.dailyProteinGoal,
        dailyCarbsGoal: profile.dailyCarbsGoal,
        dailyFatGoal: profile.dailyFatGoal,
      },
      currentWeight: weightLogs[0]?.weight ?? null,
    };
  }

  async getWeightHistory(userId: number, from?: string, to?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.weightLog.findMany({
      where: {
        userId,
        ...(from || to
          ? {
              loggedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { loggedAt: 'desc' },
      select: { weight: true, bodyFat: true, loggedAt: true },
    });
  }
}
