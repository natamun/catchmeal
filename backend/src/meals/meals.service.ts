import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ActivityService } from '../activity/activity.service';
import { ActivityType, FoodItem, MealType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto, CreateMealItemDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  private async buildItemsData(userId: number, items: CreateMealItemDto[]) {
    const ids = [
      ...new Set(
        items
          .map((item) => item.foodItemId)
          .filter((id): id is number => id !== undefined),
      ),
    ];

    const foodItems = ids.length
      ? await this.prisma.foodItem.findMany({
          where: {
            id: { in: ids },
            userId,
            OR: [{ archived: false }, { mealFoodItems: { some: {} } }],
          },
        })
      : [];

    if (foodItems.length !== ids.length) {
      throw new NotFoundException('One or more food items were not found');
    }

    const foodItemById = new Map<number, FoodItem>(
      foodItems.map((f) => [f.id, f]),
    );

    return items.map((item) => {
      if (item.foodItemId === undefined) {
        return {
          foodItemId: null,
          quantity: item.quantity,
          kcal: item.kcal!,
          protein: item.protein!,
          carbs: item.carbs!,
          fat: item.fat!,
        };
      }

      const foodItem = foodItemById.get(item.foodItemId)!;
      const scale = item.quantity / foodItem.baseQuantity;

      return {
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        kcal: foodItem.kcal * scale,
        protein: foodItem.protein * scale,
        carbs: foodItem.carbs * scale,
        fat: foodItem.fat * scale,
      };
    });
  }

  private checkLoggedMealHasType(
    loggedAt: Date | string | null | undefined,
    typeMeal: MealType | null | undefined,
  ) {
    if (loggedAt && !typeMeal)
      throw new BadRequestException('typeMeal is required for a logged meal');
  }

  async create(userId: number, dto: CreateMealDto) {
    this.checkLoggedMealHasType(dto.loggedAt, dto.typeMeal);
    const items = await this.buildItemsData(userId, dto.items);
    const kcal = items.reduce((sum, item) => sum + item.kcal, 0);

    const meal = await this.prisma.meal.create({
      data: {
        userId,
        name: dto.name,
        typeMeal: dto.typeMeal,
        loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : undefined,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    if (meal.loggedAt) {
      await this.activityService.record(userId, ActivityType.MEAL_LOGGED, {
        name: meal.name,
        kcal: Math.round(kcal),
      });
      await this.checkGoalReached(userId, meal.loggedAt);
    }

    return meal;
  }

  private async checkGoalReached(userId: number, day: Date) {
    const dayKey = day.toISOString().slice(0, 10);
    if (dayKey !== new Date().toISOString().slice(0, 10)) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCalorieGoal: true },
    });
    if (!user?.dailyCalorieGoal) return;

    const dayMeals = await this.prisma.meal.findMany({
      where: { userId, loggedAt: day },
      include: { items: true },
    });
    const total = dayMeals.reduce(
      (sum, meal) => sum + meal.items.reduce((s, item) => s + item.kcal, 0),
      0,
    );
    const ratio = total / user.dailyCalorieGoal;
    if (ratio < 0.9 || ratio > 1) return;

    await this.activityService.recordGoalReached(userId, dayKey);
  }

  findAll(userId: number, logged?: boolean, date?: Date) {
    const loggedAt = date
      ? date
      : logged === undefined
        ? undefined
        : logged
          ? { not: null }
          : null;

    return this.prisma.meal.findMany({
      where: { userId, loggedAt },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
  }

  findOne(userId: number, id: number) {
    return this.prisma.meal.findFirstOrThrow({
      where: { id, userId },
      include: { items: true },
    });
  }

  async update(userId: number, id: number, dto: UpdateMealDto) {
    if (dto.loggedAt !== undefined || dto.typeMeal !== undefined) {
      const meal = await this.prisma.meal.findFirstOrThrow({
        where: { id, userId },
        select: { loggedAt: true, typeMeal: true },
      });
      this.checkLoggedMealHasType(
        dto.loggedAt ?? meal.loggedAt,
        dto.typeMeal === undefined ? meal.typeMeal : dto.typeMeal,
      );
    }

    const items = dto.items
      ? await this.buildItemsData(userId, dto.items)
      : undefined;

    return this.prisma.meal.update({
      where: { id_userId: { id, userId } },
      data: {
        name: dto.name,
        typeMeal: dto.typeMeal,
        loggedAt:
          dto.loggedAt === undefined ? undefined : new Date(dto.loggedAt),
        items: items
          ? {
              deleteMany: {},
              create: items,
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  remove(userId: number, id: number) {
    return this.prisma.meal.delete({
      where: { id_userId: { id, userId } },
    });
  }

  async findRange(userId: number, from: Date, to: Date) {
    return this.prisma.meal.findMany({
      where: { userId: userId, loggedAt: { gte: from, lte: to } },
      include: {
        items: {
          include: {
            foodItem: { select: { name: true, brand: true, baseUnit: true } },
          },
        },
      },
      orderBy: [{ loggedAt: 'asc' }, { id: 'asc' }],
    });
  }
}
