import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

describe('DashboardAnalyticsService', () => {
  let service: DashboardAnalyticsService;

  const prismaMock = {
    meal: { findMany: jest.fn() },
    weightLog: { findMany: jest.fn() },
    goalSetting: { findMany: jest.fn(), findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prismaMock.goalSetting.findFirst.mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardAnalyticsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DashboardAnalyticsService>(DashboardAnalyticsService);
  });

  function expectDayEntry(overrides = {}) {
    return {
      day: '2026-08-17',
      totalKcal: null,
      totalProtein: null,
      totalCarbs: null,
      totalFat: null,
      weight: null,
      bodyFat: null,
      fatFreeMass: null,
      bodyWater: null,
      muscleMass: null,
      goalKcal: null,
      objective: null,
      ...overrides,
    };
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return an empty array [] when no data exists', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([]);
    prismaMock.goalSetting.findMany.mockResolvedValue([]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([]);
  });

  it('should be return only meal table', async () => {
    prismaMock.meal.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        items: [
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
        ],
      },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({
        totalKcal: 600,
        totalProtein: 60,
        totalCarbs: 60,
        totalFat: 60,
      }),
    ]);
  });

  it('should be return only weightLog table', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        weight: 233,
        bodyFat: 31,
        fatFreeMass: 160.8,
        bodyWater: 50.4,
        muscleMass: 152,
      },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({
        weight: 233,
        bodyFat: 31,
        fatFreeMass: 160.8,
        bodyWater: 50.4,
        muscleMass: 152,
      }),
    ]);
  });

  it('should be return only goalSetting table', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([]);
    prismaMock.goalSetting.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-17'),
        objective: 76,
        dailyCalories: 2300,
      },
    ]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({ objective: 76, goalKcal: 2300 }),
    ]);
  });

  it('should apply the goal set before the period to every day', async () => {
    const from = new Date('2026-08-01');
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      { id: 1, userId: 1, loggedAt: new Date('2026-08-17'), weight: 80 },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([]);
    prismaMock.goalSetting.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      startDate: new Date('2026-07-01'),
      objective: 'lose',
      dailyCalories: 2000,
    });

    const dashboard = await service.getDashboard(
      1,
      from,
      new Date('2026-08-31'),
    );

    expect(prismaMock.goalSetting.findFirst).toHaveBeenCalledWith({
      where: { userId: 1, startDate: { lt: from } },
      orderBy: { startDate: 'desc' },
    });
    expect(dashboard).toEqual([
      expectDayEntry({ weight: 80, goalKcal: 2000, objective: 'lose' }),
    ]);
  });

  it('should replace the earlier goal from the day it changes without carrying the weight forward', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      { id: 1, userId: 1, loggedAt: new Date('2026-08-17'), weight: 80 },
      { id: 2, userId: 1, loggedAt: new Date('2026-08-19'), weight: 79 },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([
      {
        id: 2,
        userId: 1,
        startDate: new Date('2026-08-18'),
        objective: 'lose',
        dailyCalories: 1600,
      },
    ]);
    prismaMock.goalSetting.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      startDate: new Date('2026-07-01'),
      objective: 'gain',
      dailyCalories: 2000,
    });

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );

    expect(dashboard).toEqual([
      expectDayEntry({ weight: 80, goalKcal: 2000, objective: 'gain' }),
      expectDayEntry({
        day: '2026-08-18',
        weight: null,
        goalKcal: 1600,
        objective: 'lose',
      }),
      expectDayEntry({
        day: '2026-08-19',
        weight: 79,
        goalKcal: 1600,
        objective: 'lose',
      }),
    ]);
  });

  it('should be return meal, goal and weight table', async () => {
    prismaMock.meal.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        items: [
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
        ],
      },
    ]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        weight: 233,
        bodyFat: 12.3,
      },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-17'),
        objective: 76,
        dailyCalories: 2300,
      },
    ]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({
        totalKcal: 600,
        totalProtein: 60,
        totalCarbs: 60,
        totalFat: 60,
        weight: 233,
        objective: 76,
        goalKcal: 2300,
        bodyFat: 12.3,
      }),
    ]);
  });

  it('should be return the last entry goal 2000 kcal and 70 objective', async () => {
    prismaMock.meal.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        items: [
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
        ],
      },
    ]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        weight: 233,
        bodyFat: 12.3,
      },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-17T08:00:00.000'),
        objective: 76,
        dailyCalories: 2300,
      },
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-17T13:00:00.000'),
        objective: 73,
        dailyCalories: 2220,
      },
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-17T19:00:00.000'),
        objective: 70,
        dailyCalories: 2000,
      },
    ]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({
        totalKcal: 600,
        totalProtein: 60,
        totalCarbs: 60,
        totalFat: 60,
        weight: 233,
        objective: 70,
        goalKcal: 2000,
        bodyFat: 12.3,
      }),
    ]);
  });

  it('should be return multiple day entries without carrying weight or bodyFat forward', async () => {
    prismaMock.meal.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-17'),
        items: [
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
          {
            kcal: 200,
            protein: 20,
            carbs: 20,
            fat: 20,
            quantity: 20.2,
            name: 'burger',
          },
        ],
      },
    ]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-16'),
        weight: 21,
        bodyFat: 11.9,
      },
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-18'),
        weight: 233,
        bodyFat: 12.3,
      },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-18'),
        objective: 80,
        dailyCalories: 2222,
      },
      {
        id: 1,
        userId: 1,
        startDate: new Date('2026-08-22T19:00:00.000'),
        objective: 84,
        dailyCalories: 1280,
      },
    ]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );
    expect(dashboard).toEqual([
      expectDayEntry({
        weight: 21,
        bodyFat: 11.9,
        day: '2026-08-16',
      }),
      expectDayEntry({
        totalKcal: 600,
        totalProtein: 60,
        totalCarbs: 60,
        totalFat: 60,
        weight: null,
        bodyFat: null,
        day: '2026-08-17',
      }),
      expectDayEntry({
        weight: 233,
        bodyFat: 12.3,
        day: '2026-08-18',
        objective: 80,
        goalKcal: 2222,
      }),
      expectDayEntry({
        weight: null,
        bodyFat: null,
        objective: 84,
        goalKcal: 1280,
        day: '2026-08-22',
      }),
    ]);
  });

  it('should keep each body measure independent per day with no carry-forward across days', async () => {
    prismaMock.meal.findMany.mockResolvedValue([]);
    prismaMock.weightLog.findMany.mockResolvedValue([
      {
        id: 1,
        userId: 1,
        loggedAt: new Date('2026-08-16'),
        weight: 80,
        bodyFat: 20,
        fatFreeMass: 64,
        bodyWater: 50,
        muscleMass: 55,
      },
      { id: 2, userId: 1, loggedAt: new Date('2026-08-18'), weight: 79 },
    ]);
    prismaMock.goalSetting.findMany.mockResolvedValue([]);

    const dashboard = await service.getDashboard(
      1,
      new Date('2026-08-01'),
      new Date('2026-08-31'),
    );

    expect(dashboard).toEqual([
      expectDayEntry({
        day: '2026-08-16',
        weight: 80,
        bodyFat: 20,
        fatFreeMass: 64,
        bodyWater: 50,
        muscleMass: 55,
      }),
      expectDayEntry({ day: '2026-08-18', weight: 79 }),
    ]);
  });
});
