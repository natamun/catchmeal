import { Injectable, NotFoundException } from '@nestjs/common';

import { FoodItem } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateMealDto) {
    const ids = [...new Set(dto.items.map((item) => item.foodItemId))];

    const foodItems = await this.prisma.foodItem.findMany({
      where: { id: { in: ids }, userId, archived: false },
    });

    if (foodItems.length !== ids.length) {
      throw new NotFoundException('One or more food items were not found');
    }

    const foodItemById = new Map<number, FoodItem>(
      foodItems.map((f) => [f.id, f]),
    );

    const items = dto.items.map((item) => {
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

    return this.prisma.meal.create({
      data: {
        userId,
        name: dto.name,
        typeMeal: dto.typeMeal,
        loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : undefined,
        items: {
          create: items.map((item) => ({ ...item, userId })),
        },
      },
      include: { items: true },
    });
  }
}
