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
      findMany: jest.fn(),
    },
  };
  const friendsServiceMock = { getFriendIds: jest.fn() };
  const emit = jest.fn();
  const to = jest.fn(() => ({ emit }));
  const activityGatewayMock = { server: { to } };

  const user = { id: 1, username: 'alice', name: 'Alice' };
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
        include: { user: { select: { id: true, username: true, name: true } } },
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
        include: { user: { select: { id: true, username: true, name: true } } },
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
});
