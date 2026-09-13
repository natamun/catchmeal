import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MealType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealsService } from './meals.service';

describe('MealsService', () => {
  let service: MealsService;

  const prismaMock = {
    foodItem: {
      findMany: jest.fn(),
    },
    meal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MealsService>(MealsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a meal with macros scaled by quantity', async () => {
    const dto: CreateMealDto = {
      typeMeal: MealType.LUNCH,
      loggedAt: '2026-09-13T12:00:00.000Z',
      items: [
        { foodItemId: 2, quantity: 150 },
        { foodItemId: 3, quantity: 100 },
        { foodItemId: 1, quantity: 30 },
      ],
    };
    prismaMock.foodItem.findMany.mockResolvedValue([
      { id: 1, kcal: 400, protein: 25, carbs: 1, fat: 33, baseQuantity: 100 },
      {
        id: 2,
        kcal: 130,
        protein: 2.4,
        carbs: 28,
        fat: 0.3,
        baseQuantity: 100,
      },
      { id: 3, kcal: 250, protein: 26, carbs: 0, fat: 15, baseQuantity: 100 },
    ]);
    prismaMock.meal.create.mockResolvedValue({ id: 5 });

    await service.create(7, dto);

    expect(prismaMock.foodItem.findMany).toHaveBeenCalledWith({
      where: { id: { in: [2, 3, 1] }, userId: 7, archived: false },
    });
    expect(prismaMock.meal.create).toHaveBeenCalledWith({
      data: {
        userId: 7,
        name: undefined,
        typeMeal: MealType.LUNCH,
        loggedAt: new Date('2026-09-13T12:00:00.000Z'),
        items: {
          create: [
            {
              foodItemId: 2,
              quantity: 150,
              kcal: 195,
              protein: 3.5999999999999996,
              carbs: 42,
              fat: 0.44999999999999996,
            },
            {
              foodItemId: 3,
              quantity: 100,
              kcal: 250,
              protein: 26,
              carbs: 0,
              fat: 15,
            },
            {
              foodItemId: 1,
              quantity: 30,
              kcal: 120,
              protein: 7.5,
              carbs: 0.3,
              fat: 9.9,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  it('should reject when a referenced food item does not exist', async () => {
    const dto: CreateMealDto = {
      items: [
        { foodItemId: 2, quantity: 150 },
        { foodItemId: 99, quantity: 50 },
      ],
    };
    prismaMock.foodItem.findMany.mockResolvedValue([
      {
        id: 2,
        kcal: 130,
        protein: 2.4,
        carbs: 28,
        fat: 0.3,
        baseQuantity: 100,
      },
    ]);

    await expect(service.create(7, dto)).rejects.toThrow(NotFoundException);
    expect(prismaMock.meal.create).not.toHaveBeenCalled();
  });

  it('should list meals for a user', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);

    await service.findAll(7);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7 },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
  });

  it('should find one meal scoped to its owner', async () => {
    prismaMock.meal.findFirstOrThrow.mockResolvedValue({ id: 5 });

    await service.findOne(7, 5);

    expect(prismaMock.meal.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 5, userId: 7 },
      include: { items: true },
    });
  });

  it('should update a meal using the composite unique key', async () => {
    prismaMock.meal.update.mockResolvedValue({ id: 5 });

    await service.update(7, 5, { name: 'Riz-steak' });

    expect(prismaMock.meal.update).toHaveBeenCalledWith({
      where: { id_userId: { id: 5, userId: 7 } },
      data: { name: 'Riz-steak', typeMeal: undefined, loggedAt: undefined },
      include: { items: true },
    });
  });

  it('should delete a meal for real', async () => {
    prismaMock.meal.delete.mockResolvedValue({ id: 5 });

    await service.remove(7, 5);

    expect(prismaMock.meal.delete).toHaveBeenCalledWith({
      where: { id_userId: { id: 5, userId: 7 } },
    });
  });
});
