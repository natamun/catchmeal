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

  async getMeals(userId: number, from?: string, to?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        loggedAt: { not: null },
        ...(from || to
          ? {
              loggedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      select: {
        loggedAt: true,
        items: {
          select: { kcal: true, protein: true, carbs: true, fat: true },
        },
      },
    });

    const byDay = new Map<
      string,
      { kcal: number; protein: number; carbs: number; fat: number }
    >();

    for (const meal of meals) {
      const day = meal.loggedAt!.toISOString().slice(0, 10);
      const totals = byDay.get(day) ?? {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      for (const item of meal.items) {
        totals.kcal += item.kcal;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
      }
      byDay.set(day, totals);
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, totals]) => ({
        date,
        kcal: Math.round(totals.kcal),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      }));
  }

  async getGoalSettings(userId: number, from?: string, to?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.goalSetting.findMany({
      where: {
        userId,
        ...(from || to
          ? {
              startDate: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        dailyCalories: true,
        objective: true,
        startDate: true,
      },
    });
  }

  async getFrequentFoodItems(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const grouped = await this.prisma.mealFoodItem.groupBy({
      by: ['foodItemId'],
      where: { userId, foodItemId: { not: null } },
      _count: { foodItemId: true },
      orderBy: { _count: { foodItemId: 'desc' } },
      take: 20,
    });

    const ids = grouped
      .map((g) => g.foodItemId)
      .filter((id): id is number => id !== null);

    const foodItems = await this.prisma.foodItem.findMany({
      where: { id: { in: ids }, userId, archived: false },
      select: {
        id: true,
        name: true,
        brand: true,
        kcal: true,
        protein: true,
        carbs: true,
        fat: true,
        baseQuantity: true,
        baseUnit: true,
      },
    });

    const countById = new Map(
      grouped.map((g) => [g.foodItemId, g._count.foodItemId]),
    );

    return foodItems
      .map((item) => ({ ...item, usageCount: countById.get(item.id) ?? 0 }))
      .sort((a, b) => b.usageCount - a.usageCount);
  }
}
