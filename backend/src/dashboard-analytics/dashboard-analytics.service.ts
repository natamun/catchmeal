import { Injectable } from '@nestjs/common';

import { GoalSetting, WeightLog } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type DashboardDay = {
  day: string;
  totalKcal: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  weight: number | null;
  bodyFat: number | null;
  fatFreeMass: number | null;
  bodyWater: number | null;
  muscleMass: number | null;
  goalKcal: number | null;
  objective: string | null;
};

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *  Async function to get all data about a user to build their dashboard
   * @param userId - Id of a user to get data
   * @param from - Start date of the period to analyze
   * @param to - End date of hte period to analyze
   * @returns Array of daily stats, one entry per day that has at least one
   * meal, weight log or goal setting in the period, ordered from the most
   * recent day to the oldest
   *  - day: date string(YYY-MM-DD)
   *  - totalKcal: sum of calories logged at day, or null if no meal was logged that day
   *  - totalProtein: the total amount of protein consumed per day, or null if no meal was logged that day
   *  - totalCarbs: the total amount of carbs consumed per day, or null if no meal was logged that day
   *  - totalFat: the total amount of fat consumed per day, or null if no meal was logged that day
   *  - weight: the weight logged that day, or the last known weight carried
   *    forward if none was logged that day, or null if there is no prior value
   *  - bodyFat: the body fat logged that day, or the last known value carried
   *    forward if none was logged that day, or null if there is no prior value
   *  - fatFreeMass: the fat free mass logged that day, or the last known value
   *    carried forward if none was logged that day, or null if there is no prior value
   *  - bodyWater: the body water logged that day, or the last known value
   *    carried forward if none was logged that day, or null if there is no prior value
   *  - muscleMass: the muscle mass logged that day, or the last known value
   *    carried forward if none was logged that day, or null if there is no prior value
   *  - goalKcal: the calorie goal applicable that day, or null if none was set
   *  - objective: lose or gain weight, applicable that day, or null if none was set
   */
  async getDashboard(
    userId: number,
    from: Date,
    to: Date,
  ): Promise<DashboardDay[]> {
    const [
      meals,
      weightLogs,
      goals,
      previousGoal,
      previousWeight,
      previousBodyFat,
      previousFatFreeMass,
      previousBodyWater,
      previousMuscleMass,
    ] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId: userId, loggedAt: { gte: from, lte: to } },
        include: {
          items: {
            include: {
              foodItem: {
                select: { name: true, brand: true, baseUnit: true },
              },
            },
          },
        },
        orderBy: { loggedAt: 'asc' },
      }),

      this.prisma.weightLog.findMany({
        where: { userId: userId, loggedAt: { gte: from, lte: to } },
        orderBy: { loggedAt: 'asc' },
      }),

      this.prisma.goalSetting.findMany({
        where: { userId: userId, startDate: { gte: from, lte: to } },
        orderBy: { startDate: 'asc' },
      }),

      this.prisma.goalSetting.findFirst({
        where: { userId: userId, startDate: { lt: from } },
        orderBy: { startDate: 'desc' },
      }),

      this.prisma.weightLog.findFirst({
        where: { userId: userId, loggedAt: { lte: from } },
        orderBy: { loggedAt: 'desc' },
        select: { weight: true },
      }),

      this.prisma.weightLog.findFirst({
        where: {
          userId: userId,
          loggedAt: { lte: from },
          bodyFat: { not: null },
        },
        orderBy: { loggedAt: 'desc' },
        select: { bodyFat: true },
      }),

      this.prisma.weightLog.findFirst({
        where: {
          userId: userId,
          loggedAt: { lte: from },
          fatFreeMass: { not: null },
        },
        orderBy: { loggedAt: 'desc' },
        select: { fatFreeMass: true },
      }),

      this.prisma.weightLog.findFirst({
        where: {
          userId: userId,
          loggedAt: { lte: from },
          bodyWater: { not: null },
        },
        orderBy: { loggedAt: 'desc' },
        select: { bodyWater: true },
      }),

      this.prisma.weightLog.findFirst({
        where: {
          userId: userId,
          loggedAt: { lte: from },
          muscleMass: { not: null },
        },
        orderBy: { loggedAt: 'desc' },
        select: { muscleMass: true },
      }),
    ]);

    interface MacroTotalsDay {
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    }

    const totalsByDay: Record<string, MacroTotalsDay> = {};
    for (const meal of meals) {
      if (!meal.loggedAt) continue;
      const day = meal.loggedAt.toISOString().split('T')[0];
      if (!totalsByDay[day]) {
        totalsByDay[day] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
      }
      if (meal.items) {
        for (const item of meal.items) {
          totalsByDay[day].kcal += item.kcal;
          totalsByDay[day].protein += item.protein;
          totalsByDay[day].carbs += item.carbs;
          totalsByDay[day].fat += item.fat;
        }
      }
    }

    const weightLogsDay: Record<string, WeightLog> = {};
    for (const log of weightLogs) {
      const day = log.loggedAt.toISOString().split('T')[0];
      weightLogsDay[day] = log;
    }

    const getGoalDate = (date: Date) => {
      const newDate = new Date(date);
      newDate.setHours(23, 59, 59, 999);
      const applicable = goals.filter((g) => g.startDate <= newDate);
      return applicable[applicable.length - 1] ?? previousGoal ?? null;
    };

    const allDays = Array.from(
      new Set([
        ...Object.keys(totalsByDay),
        ...Object.keys(weightLogsDay),
        ...goals.map(
          (item: GoalSetting) => item.startDate.toISOString().split('T')[0],
        ),
      ]),
    ).sort();

    let lastWeight: number | null = previousWeight?.weight ?? null;
    let lastBodyFat: number | null = previousBodyFat?.bodyFat ?? null;
    let lastFatFreeMass: number | null =
      previousFatFreeMass?.fatFreeMass ?? null;
    let lastBodyWater: number | null = previousBodyWater?.bodyWater ?? null;
    let lastMuscleMass: number | null = previousMuscleMass?.muscleMass ?? null;

    const dashboard = allDays.map((day) => {
      const goal = getGoalDate(new Date(day));
      const log = weightLogsDay[day];
      if (log) {
        lastWeight = log.weight ?? lastWeight;
        lastBodyFat = log.bodyFat ?? lastBodyFat;
        lastFatFreeMass = log.fatFreeMass ?? lastFatFreeMass;
        lastBodyWater = log.bodyWater ?? lastBodyWater;
        lastMuscleMass = log.muscleMass ?? lastMuscleMass;
      }
      return {
        day,
        totalKcal: totalsByDay[day] ? Math.round(totalsByDay[day].kcal) : null,
        totalProtein: totalsByDay[day]
          ? Math.round(totalsByDay[day].protein)
          : null,
        totalCarbs: totalsByDay[day]
          ? Math.round(totalsByDay[day].carbs)
          : null,
        totalFat: totalsByDay[day] ? Math.round(totalsByDay[day].fat) : null,
        weight: lastWeight,
        bodyFat: lastBodyFat,
        fatFreeMass: lastFatFreeMass,
        bodyWater: lastBodyWater,
        muscleMass: lastMuscleMass,
        goalKcal: goal?.dailyCalories ?? null,
        objective: goal?.objective ?? null,
      };
    });
    return dashboard.reverse();
  }
}
