import { Injectable, NotFoundException } from '@nestjs/common';

import { FoodItem } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto, CreateMealItemDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

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
          where: { id: { in: ids }, userId, archived: false },
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

  async create(userId: number, dto: CreateMealDto) {
    const items = await this.buildItemsData(userId, dto.items);

    return this.prisma.meal.create({
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
  }

  findAll(userId: number) {
    return this.prisma.meal.findMany({
      where: { userId },
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
}
