import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActivityService } from '../activity/activity.service';
import { ActivityType, MealType } from '../generated/prisma/enums';
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
    user: {
      findUnique: jest.fn(),
    },
    activity: {
      findFirst: jest.fn(),
    },
  };

  const activityServiceMock = {
    record: jest.fn(),
    recordGoalReached: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ActivityService, useValue: activityServiceMock },
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

  it('should create a meal with quick-add items using client-supplied macros', async () => {
    const dto: CreateMealDto = {
      name: 'Snack rapide',
      items: [{ quantity: 1, kcal: 200, protein: 5, carbs: 20, fat: 8 }],
    };
    prismaMock.meal.create.mockResolvedValue({ id: 6 });

    await service.create(7, dto);

    expect(prismaMock.foodItem.findMany).not.toHaveBeenCalled();
    expect(prismaMock.meal.create).toHaveBeenCalledWith({
      data: {
        userId: 7,
        name: 'Snack rapide',
        typeMeal: undefined,
        loggedAt: undefined,
        items: {
          create: [
            {
              foodItemId: null,
              quantity: 1,
              kcal: 200,
              protein: 5,
              carbs: 20,
              fat: 8,
            },
          ],
        },
      },
      include: { items: true },
    });
  });

  it('should create a meal mixing food-item and quick-add items', async () => {
    const dto: CreateMealDto = {
      items: [
        { foodItemId: 1, quantity: 30 },
        { quantity: 1, kcal: 200, protein: 5, carbs: 20, fat: 8 },
      ],
    };
    prismaMock.foodItem.findMany.mockResolvedValue([
      { id: 1, kcal: 400, protein: 25, carbs: 1, fat: 33, baseQuantity: 100 },
    ]);
    prismaMock.meal.create.mockResolvedValue({ id: 7 });

    await service.create(7, dto);

    expect(prismaMock.foodItem.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1] }, userId: 7, archived: false },
    });
    expect(prismaMock.meal.create).toHaveBeenCalledWith({
      data: {
        userId: 7,
        name: undefined,
        typeMeal: undefined,
        loggedAt: undefined,
        items: {
          create: [
            {
              foodItemId: 1,
              quantity: 30,
              kcal: 120,
              protein: 7.5,
              carbs: 0.3,
              fat: 9.9,
            },
            {
              foodItemId: null,
              quantity: 1,
              kcal: 200,
              protein: 5,
              carbs: 20,
              fat: 8,
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

  it('should list all meals for a user when logged is not specified', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);

    await service.findAll(7);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: undefined },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
  });

  it('should list only logged meals when logged is true', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);

    await service.findAll(7, true);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: { not: null } },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
  });

  it('should list only template meals when logged is false', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);

    await service.findAll(7, false);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: null },
      include: { items: true },
      orderBy: { id: 'desc' },
    });
  });

  it('should list meals for a specific date regardless of logged', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    const date = new Date('2026-09-18');

    await service.findAll(7, undefined, date);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: date },
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

    expect(prismaMock.foodItem.findMany).not.toHaveBeenCalled();
    expect(prismaMock.meal.update).toHaveBeenCalledWith({
      where: { id_userId: { id: 5, userId: 7 } },
      data: {
        name: 'Riz-steak',
        typeMeal: undefined,
        loggedAt: undefined,
        items: undefined,
      },
      include: { items: true },
    });
  });

  it('should replace items when updating a meal with a new items array', async () => {
    prismaMock.foodItem.findMany.mockResolvedValue([
      { id: 1, kcal: 400, protein: 25, carbs: 1, fat: 33, baseQuantity: 100 },
    ]);
    prismaMock.meal.update.mockResolvedValue({ id: 5 });

    await service.update(7, 5, {
      items: [{ foodItemId: 1, quantity: 50 }],
    });

    expect(prismaMock.foodItem.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1] }, userId: 7, archived: false },
    });
    expect(prismaMock.meal.update).toHaveBeenCalledWith({
      where: { id_userId: { id: 5, userId: 7 } },
      data: {
        name: undefined,
        typeMeal: undefined,
        loggedAt: undefined,
        items: {
          deleteMany: {},
          create: [
            {
              foodItemId: 1,
              quantity: 50,
              kcal: 200,
              protein: 12.5,
              carbs: 0.5,
              fat: 16.5,
            },
          ],
        },
      },
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

  it('should find meals within a date range for a user, with food item names', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    const from = new Date('2026-09-01');
    const to = new Date('2026-09-18');

    await service.findRange(7, from, to);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: { gte: from, lte: to } },
      include: {
        items: {
          include: {
            foodItem: { select: { name: true, brand: true, baseUnit: true } },
          },
        },
      },
      orderBy: [{ loggedAt: 'asc' }, { id: 'asc' }],
    });
  });

  it('should return the meals with their food item names unchanged', async () => {
    const meals = [
      {
        id: 1,
        loggedAt: new Date('2026-09-17'),
        items: [
          {
            quantity: 150,
            foodItem: { name: 'Riz blanc', brand: null, baseUnit: 'GRAM' },
          },
        ],
      },
      {
        id: 2,
        loggedAt: new Date('2026-09-16'),
        items: [{ quantity: 1, foodItem: null }],
      },
    ];
    prismaMock.meal.findMany.mockResolvedValue(meals);

    const result = await service.findRange(
      7,
      new Date('2026-09-01'),
      new Date('2026-09-18'),
    );

    expect(result).toEqual(meals);
  });

  it('should handle a range spanning a single day', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    const sameDay = new Date('2026-09-18');

    await service.findRange(7, sameDay, sameDay);

    expect(prismaMock.meal.findMany).toHaveBeenCalledWith({
      where: { userId: 7, loggedAt: { gte: sameDay, lte: sameDay } },
      include: {
        items: {
          include: {
            foodItem: { select: { name: true, brand: true, baseUnit: true } },
          },
        },
      },
      orderBy: [{ loggedAt: 'asc' }, { id: 'asc' }],
    });
  });

  describe('friend activities on create', () => {
    const today = '2026-09-13';
    const dto: CreateMealDto = {
      name: 'Oeuf fromage',
      loggedAt: `${today}T00:00:00.000Z`,
      items: [{ quantity: 1, kcal: 349.6, protein: 20, carbs: 1, fat: 25 }],
    };

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(`${today}T12:00:00.000Z`));
      prismaMock.meal.create.mockResolvedValue({
        id: 1,
        name: 'Oeuf fromage',
        loggedAt: new Date(`${today}T00:00:00.000Z`),
        items: [],
      });
      prismaMock.user.findUnique.mockResolvedValue({ dailyCalorieGoal: 2000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should record MEAL_LOGGED with the meal name and rounded kcal', async () => {
      prismaMock.meal.findMany.mockResolvedValue([]);

      await service.create(7, dto);

      expect(activityServiceMock.record).toHaveBeenCalledWith(
        7,
        ActivityType.MEAL_LOGGED,
        { name: 'Oeuf fromage', kcal: 350 },
      );
    });

    it('should not record anything for a template meal without loggedAt', async () => {
      prismaMock.meal.create.mockResolvedValue({ id: 2, loggedAt: null });

      await service.create(7, { ...dto, loggedAt: undefined });

      expect(activityServiceMock.record).not.toHaveBeenCalled();
      expect(activityServiceMock.recordGoalReached).not.toHaveBeenCalled();
    });

    it.each([
      [1700, false],
      [1800, true],
      [2000, true],
      [2001, false],
    ])(
      'with %i kcal of a 2000 goal, goal reached recorded: %s',
      async (total, expected) => {
        prismaMock.meal.findMany.mockResolvedValue([
          { items: [{ kcal: total }] },
        ]);

        await service.create(7, dto);

        if (expected) {
          expect(activityServiceMock.recordGoalReached).toHaveBeenCalledWith(
            7,
            today,
          );
        } else {
          expect(activityServiceMock.recordGoalReached).not.toHaveBeenCalled();
        }
      },
    );

    it('should not check the goal for a meal logged on a past day', async () => {
      prismaMock.meal.create.mockResolvedValue({
        id: 3,
        name: 'Hier',
        loggedAt: new Date('2026-09-12T00:00:00.000Z'),
        items: [],
      });

      await service.create(7, { ...dto, loggedAt: '2026-09-12T00:00:00.000Z' });

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(activityServiceMock.recordGoalReached).not.toHaveBeenCalled();
    });

    it('should not check the goal when the user has none', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ dailyCalorieGoal: null });

      await service.create(7, dto);

      expect(prismaMock.meal.findMany).not.toHaveBeenCalled();
    });
  });
});
