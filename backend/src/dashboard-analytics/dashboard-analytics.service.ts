import { Injectable } from '@nestjs/common';

import { GoalSetting, WeightLog } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *  Async function to get all data about a user to build their dashboard
   * @param userId - Id of a user to get data
   * @param from - Start date of the period to analyze
   * @param to - End date of hte period to analyze
   * @returns Array of daily stats
   *  - day: date string(YYY-MM-DD)
   *  - totalKcal: sum of calories logged at day
   *  - totalProtein: the total amount of protein consumed per day
   *  - totalCarbs: the total amount of carbs consumed per day
   *  - totalFat: the total amount of fat consumed per day
   *  - weight: the weight logged that day or null if none was set
   *  - bodyFat: the value of body fat
   *  - fatFreeMass: the fat free mass logged that day
   *  - bodyWater: the body water logged that day
   *  - muscleMass: the muscle mass logged that day
   *  - goalKcal: the calorie goal or null if none was set
   *  - objective: lose or gain weight
   */
  async getDashboard(userId: number, from: Date, to: Date) {
    const [meals, weightLogs, goals, previousGoal] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId: userId, loggedAt: { gte: from, lte: to } },
        include: {
          items: {
            include: {
              foodItem: { select: { name: true, brand: true, baseUnit: true } },
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

    const dashboard = allDays.map((day) => {
      const goal = getGoalDate(new Date(day));
      return {
        day,
        totalKcal: totalsByDay[day]?.kcal ?? null,
        totalProtein: totalsByDay[day]?.protein ?? null,
        totalCarbs: totalsByDay[day]?.carbs ?? null,
        totalFat: totalsByDay[day]?.fat ?? null,
        weight: weightLogsDay[day]?.weight ?? null,
        bodyFat: weightLogsDay[day]?.bodyFat ?? null,
        fatFreeMass: weightLogsDay[day]?.fatFreeMass ?? null,
        bodyWater: weightLogsDay[day]?.bodyWater ?? null,
        muscleMass: weightLogsDay[day]?.muscleMass ?? null,
        goalKcal: goal?.dailyCalories ?? null,
        objective: goal?.objective ?? null,
      };
    });
    return dashboard;
  }
}
