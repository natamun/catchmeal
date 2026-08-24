import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalSetting, WeightLog } from '../generated/prisma/client';

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   *  Async function to get all Meal for a user
   * @param userId - Id of a user to get data
   * @returns All meals matching the userId, including their MealItems
   */
  // async getMealForUser(userId: number) {
  //   return this.prisma.meal.findMany({
  //     where: { userId: userId },
  //     include: { items: true },
  //   });
  // }

  /**
   *  Async function to get all data about a user to build their dashboard
   * @param userId - Id of a user to get data
   * @param from - Start date of the period to analyze
   * @param to - End date of hte period to analyze
   * @returns Array of daily stats
   *  - day: date string(YYY-MM-DD)
   *  - totalKcal: sum of calories logged at day
   *  - goalKcal: the calorie goal or null if none was set
   *  - isOverGoal: whether totalKcal exceeded goalKcal, or null if no goal
   *  - weight: the weight logged that day or null if none was set
   */
  async getDashboard(userId: number, from: Date, to: Date) {
    const [meals, weightLogs, goals] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId: userId, loggedAt: { gte: from, lte: to} },
        include: { items: true },
      }),

      this.prisma.weightLog.findMany({
        where: { userId: userId, loggedAt: { gte: from, lte: to } },
        orderBy: { loggedAt: 'asc' },
      }),

      this.prisma.goalSetting.findMany({
        where: { userId: userId, startDate: { gte: from, lte: to } },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    if (meals.length === 0 && weightLogs.length === 0 && goals.length === 0) {
      return null;
    }

    interface MacroTotalsDay {
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    }

    //  Total Macro for a day
    const totalsByDay: Record<string, MacroTotalsDay> = {};
    for (const meal of meals) {
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
      if (!date) {
        return null;
      }
      const newDate  = new Date(date);
      newDate.setHours(23, 59, 59, 999);
      const applicable = goals.filter((g) => g.startDate <= newDate);
      return applicable[applicable.length - 1] ?? null;
    }

    const allDays = Array.from(new Set([
      ...Object.keys(totalsByDay),
      ...Object.keys(weightLogsDay),
      ...goals.map((item: GoalSetting) => item.startDate.toISOString().split('T')[0]),
    ])
    ).sort();
    const dashboard = allDays.map((day) => {
      const goal = getGoalDate(new Date(day));
      return {
        day,
        totalKcal: totalsByDay[day]?.kcal ?? null,
        totalProtein: totalsByDay[day]?.protein ?? null,
        totalCarbs: totalsByDay[day]?.carbs ?? null,
        totalFat: totalsByDay[day]?.fat ?? null,
        goalKcal: goal?.dailyCalories ?? null,
        objective: goal?.objective ?? null,
        weight: weightLogsDay[day]?.weight ?? null,
        bodyFat: weightLogsDay[day]?.bodyFat ?? null,
        noteWeight: weightLogsDay[day]?.note ?? null,
      };
    });
    return dashboard;
  }
}
