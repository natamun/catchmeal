import { Test, TestingModule } from '@nestjs/testing';

import { FriendsService } from '../friends/friends.service';
import { Prisma } from '../generated/prisma/client';
import { ActivityType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityGateway } from './activity.gateway';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;

  const prismaMock = {
    activity: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const friendsServiceMock = { getFriendIds: jest.fn() };
  const emit = jest.fn();
  const to = jest.fn(() => ({ emit }));
  const activityGatewayMock = { server: { to } };

  const user = { id: 1, username: 'alice', name: 'Alice', avatarUrl: null };
  const createdAt = new Date('2026-10-08T10:00:00.000Z');

  beforeEach(async () => {
    jest.resetAllMocks();
    to.mockImplementation(() => ({ emit }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: FriendsService, useValue: friendsServiceMock },
        { provide: ActivityGateway, useValue: activityGatewayMock },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  describe('toFeedItem', () => {
    const cases: [ActivityType, Prisma.JsonValue, string][] = [
      [
        ActivityType.MEAL_LOGGED,
        { name: 'Oeuf fromage', kcal: 350 },
        'a enregistré [Oeuf fromage] (350 kcal)',
      ],
      [ActivityType.MEAL_LOGGED, {}, 'a enregistré un repas'],
      [
        ActivityType.WEIGHT_LOGGED,
        { weight: 70 },
        'a enregistré son poids (70 kg)',
      ],
      [ActivityType.WEIGHT_LOGGED, null, 'a enregistré son poids'],
      [
        ActivityType.GOAL_REACHED,
        null,
        'a atteint son objectif calorique du jour',
      ],
      [
        ActivityType.CALORIE_GOAL_CHANGED,
        { goal: 2200 },
        'a changé son objectif calorique (2200 kcal)',
      ],
      [
        ActivityType.WEIGHT_GOAL_REACHED,
        { targetWeight: 70 },
        'a atteint son poids cible (70 kg)',
      ],
      [
        ActivityType.STREAK_REACHED,
        { days: 7 },
        'a atteint son objectif calorique 7 jours de suite',
      ],
      [
        ActivityType.STREAK_REACHED,
        null,
        'a atteint son objectif calorique plusieurs jours de suite',
      ],
    ];

    it.each(cases)('should format %s with %j', (type, metadata, message) => {
      const item = service.toFeedItem({
        id: 1,
        type,
        metadata,
        createdAt,
        user,
      });

      expect(item).toEqual({ id: 1, type, message, createdAt, user });
    });
  });

  describe('record', () => {
    const created = {
      id: 9,
      userId: 1,
      type: ActivityType.MEAL_LOGGED,
      metadata: { name: 'Oeuf fromage', kcal: 350 },
      createdAt,
      user,
    };

    it('should create the activity and notify each friend room', async () => {
      prismaMock.activity.create.mockResolvedValue(created);
      friendsServiceMock.getFriendIds.mockResolvedValue([2, 3]);

      const result = await service.record(1, ActivityType.MEAL_LOGGED, {
        name: 'Oeuf fromage',
        kcal: 350,
      });

      expect(prismaMock.activity.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          type: ActivityType.MEAL_LOGGED,
          metadata: { name: 'Oeuf fromage', kcal: 350 },
        },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
      });
      expect(to).toHaveBeenCalledTimes(2);
      expect(to).toHaveBeenCalledWith('user:2');
      expect(to).toHaveBeenCalledWith('user:3');
      expect(emit).toHaveBeenCalledWith('activity:new', {
        id: 9,
        type: ActivityType.MEAL_LOGGED,
        message: 'a enregistré [Oeuf fromage] (350 kcal)',
        createdAt,
        user,
      });
      expect(result).toBe(created);
    });

    it('should not notify the author, only friends', async () => {
      prismaMock.activity.create.mockResolvedValue(created);
      friendsServiceMock.getFriendIds.mockResolvedValue([2]);

      await service.record(1, ActivityType.MEAL_LOGGED);

      expect(to).not.toHaveBeenCalledWith('user:1');
    });

    it('should still create the activity when the user has no friends', async () => {
      prismaMock.activity.create.mockResolvedValue(created);
      friendsServiceMock.getFriendIds.mockResolvedValue([]);

      await service.record(1, ActivityType.MEAL_LOGGED);

      expect(prismaMock.activity.create).toHaveBeenCalled();
      expect(to).not.toHaveBeenCalled();
    });
  });

  describe('recordGoalReached', () => {
    const lastDays = (end: string, count: number) =>
      Array.from({ length: count }, (_, i) => {
        const date = new Date(`${end}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() - i);
        return { metadata: { day: date.toISOString().slice(0, 10) } };
      });

    let recordSpy: jest.SpyInstance;

    beforeEach(() => {
      recordSpy = jest.spyOn(service, 'record').mockResolvedValue({} as never);
      prismaMock.activity.findFirst.mockResolvedValue(null);
    });

    it('should do nothing when the goal was already recorded for that day', async () => {
      prismaMock.activity.findFirst.mockResolvedValue({ id: 1 });

      await service.recordGoalReached(1, '2026-10-10');

      expect(prismaMock.activity.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: ActivityType.GOAL_REACHED,
          metadata: { path: ['day'], equals: '2026-10-10' },
        },
        select: { id: true },
      });
      expect(recordSpy).not.toHaveBeenCalled();
    });

    it('should record the goal with its day and no streak below a milestone', async () => {
      prismaMock.activity.findMany.mockResolvedValue(lastDays('2026-10-10', 3));

      await service.recordGoalReached(1, '2026-10-10');

      expect(recordSpy).toHaveBeenCalledTimes(1);
      expect(recordSpy).toHaveBeenCalledWith(1, ActivityType.GOAL_REACHED, {
        day: '2026-10-10',
      });
    });

    it('should record STREAK_REACHED after 7 consecutive days', async () => {
      prismaMock.activity.findMany.mockResolvedValue(lastDays('2026-10-10', 7));

      await service.recordGoalReached(1, '2026-10-10');

      expect(recordSpy).toHaveBeenLastCalledWith(
        1,
        ActivityType.STREAK_REACHED,
        { days: 7 },
      );
    });

    it('should not count a streak across a missing day', async () => {
      prismaMock.activity.findMany.mockResolvedValue([
        ...lastDays('2026-10-10', 6),
        ...lastDays('2026-10-03', 3),
      ]);

      await service.recordGoalReached(1, '2026-10-10');

      expect(recordSpy).toHaveBeenCalledTimes(1);
    });

    it('should not repeat the 30-day milestone on the 31st day', async () => {
      prismaMock.activity.findMany.mockResolvedValue(
        lastDays('2026-10-10', 31),
      );

      await service.recordGoalReached(1, '2026-10-10');

      expect(recordSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFriendsFeed', () => {
    it('should return an empty feed without querying when there are no friends', async () => {
      friendsServiceMock.getFriendIds.mockResolvedValue([]);

      const result = await service.getFriendsFeed(1);

      expect(result).toEqual([]);
      expect(prismaMock.activity.findMany).not.toHaveBeenCalled();
    });

    it('should load the 30 latest activities of active friends and format them', async () => {
      friendsServiceMock.getFriendIds.mockResolvedValue([2, 3]);
      prismaMock.activity.findMany.mockResolvedValue([
        {
          id: 4,
          userId: 2,
          type: ActivityType.GOAL_REACHED,
          metadata: null,
          createdAt,
          user: { id: 2, username: 'bob', name: 'Bob' },
        },
      ]);

      const result = await service.getFriendsFeed(1);

      expect(prismaMock.activity.findMany).toHaveBeenCalledWith({
        where: { userId: { in: [2, 3] }, user: { deletedAt: null } },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      expect(result).toEqual([
        {
          id: 4,
          type: ActivityType.GOAL_REACHED,
          message: 'a atteint son objectif calorique du jour',
          createdAt,
          user: { id: 2, username: 'bob', name: 'Bob' },
        },
      ]);
    });
  });

  describe('removeByWeightLog', () => {
    it('should delete the activities linked to the weight entry and notify frineds', async () => {
      prismaMock.activity.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      friendsServiceMock.getFriendIds.mockResolvedValue([2, 3]);

      await service.removeByWeightLog(1, 7);

      expect(prismaMock.activity.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          metadata: { path: ['weightLogId'], equals: 7 },
        },
        select: { id: true },
      });
      expect(prismaMock.activity.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: [10, 11] } },
      });
      expect(to).toHaveBeenCalledWith('user:2');
      expect(to).toHaveBeenCalledWith('user:3');
      expect(emit).toHaveBeenCalledTimes(4);
      expect(emit).toHaveBeenCalledWith('activity:removed', { id: 10 });
      expect(emit).toHaveBeenCalledWith('activity:removed', { id: 11 });
    });

    it('should do nothing when no activity is linked to the entry', async () => {
      prismaMock.activity.findMany.mockResolvedValue([]);

      await service.removeByWeightLog(1, 7);

      expect(prismaMock.activity.deleteMany).not.toHaveBeenCalled();
      expect(friendsServiceMock.getFriendIds).not.toHaveBeenCalled();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe('updateWeightActivity', () => {
    it('should rewrite the weight in the linked activity and notify friends', async () => {
      prismaMock.activity.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.activity.update.mockResolvedValue({
        id: 10,
        type: ActivityType.WEIGHT_LOGGED,
        metadata: { weight: 72, weightLogId: 7 },
        createdAt,
        user,
      });
      friendsServiceMock.getFriendIds.mockResolvedValue([2, 3]);

      await service.updateWeightActivity(1, 7, 72);

      expect(prismaMock.activity.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: ActivityType.WEIGHT_LOGGED,
          metadata: { path: ['weightLogId'], equals: 7 },
        },
        select: { id: true },
      });
      expect(prismaMock.activity.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { metadata: { weight: 72, weightLogId: 7 } },
        include: {
          user: { select: { id: true, username: true, name: true, avatarUrl: true} }
        },
      });
      expect(to).toHaveBeenCalledWith('user:2');
      expect(to).toHaveBeenCalledWith('user:3');
      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith('activity:updated', {
        id: 10,
        type: ActivityType.WEIGHT_LOGGED,
        message: 'a enregistré son poids (72 kg)',
        createdAt,
        user,
      });
    });

    it('should do nothing when no activity is linked to the entry', async () => {
      prismaMock.activity.findFirst.mockResolvedValue(null);

      await service.updateWeightActivity(1, 7, 72);

      expect(prismaMock.activity.update).not.toHaveBeenCalled();
      expect(friendsServiceMock.getFriendIds).not.toHaveBeenCalled();
      expect(emit).not.toHaveBeenCalled();
    });
  });
});
