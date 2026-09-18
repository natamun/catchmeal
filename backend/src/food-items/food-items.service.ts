import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';

@Injectable()
export class FoodItemsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, dto: CreateFoodItemDto) {
    return this.prisma.foodItem.create({
      data: { ...dto, userId },
    });
  }

  findAll(userId: number) {
    return this.prisma.foodItem.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  findOne(userId: number, id: number) {
    return this.prisma.foodItem.findFirstOrThrow({
      where: { id, userId, archived: false },
    });
  }

  update(userId: number, id: number, dto: UpdateFoodItemDto) {
    return this.prisma.foodItem.update({
      where: { id_userId: { id, userId }, archived: false },
      data: dto,
    });
  }

  archive(userId: number, id: number) {
    return this.prisma.foodItem.update({
      where: { id_userId: { id, userId }, archived: false },
      data: { archived: true },
    });
  }
}
