import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
    weightLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const supabaseMock = {
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
  };

  const activityServiceMock = {
    record: jest.fn(),
    removeByWeightLog: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: ActivityService, useValue: activityServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with the given data', async () => {
    const data = {
      username: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'hashed',
    };
    prismaMock.user.create.mockResolvedValue({ id: 1, ...data });

    await service.create(data);

    expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
  });

  it('should find a user by id', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 1 });

    await service.findById(1);

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 1, deletedAt: null },
    });
  });

  it('should find a user by username', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 1, username: 'alice' });

    await service.findUserByName('alice');

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { username: 'alice', deletedAt: null },
    });
  });

  it('should log a weight entry', async () => {
    const entry = {
      id: 1,
      weight: 75.5,
      bodyFat: null,
      fatFreeMass: null,
      bodyWater: null,
      muscleMass: null,
      loggedAt: new Date(),
    };
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      targetWeight: null,
    });
    prismaMock.weightLog.create.mockResolvedValue(entry);

    const result = await service.logWeight(1, 75.5);

    expect(prismaMock.weightLog.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        weight: 75.5,
        bodyFat: undefined,
        fatFreeMass: undefined,
        bodyWater: undefined,
        muscleMass: undefined,
      },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
        loggedAt: true,
      },
    });
    expect(result).toEqual(entry);
  });

  it('should link the weight activity to the logged entry', async () => {
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      targetWeight: null,
    });
    prismaMock.weightLog.create.mockResolvedValue({ id: 7, weight: 75.5 });

    await service.logWeight(1, 75.5);

    expect(activityServiceMock.record).toHaveBeenCalledWith(
      1,
      ActivityType.WEIGHT_LOGGED,
      { weight: 75.5, weightLogId: 7 },
    );
  });

  it('should link the weight goal activity to the logged entry', async () => {
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      targetWeight: 80,
    });
    prismaMock.weightLog.findFirst.mockResolvedValue({ weight: 82 });
    prismaMock.weightLog.create.mockResolvedValue({ id: 8, weight: 79.8 });

    await service.logWeight(1, 79.8);

    expect(activityServiceMock.record).toHaveBeenCalledWith(
      1,
      ActivityType.WEIGHT_GOAL_REACHED,
      { targetWeight: 80, weightLogId: 8 },
    );
  });

  it.each<[number | undefined, number, number, boolean]>([
    [82, 79.8, 80, true],
    [81, 80, 80, true],
    [79, 80.5, 80, true],
    [79.5, 79, 80, false],
    [80, 79, 80, false],
    [81, 80.5, 80, false],
    [undefined, 79, 80, false],
  ])(
    'logging %s -> %s with a %s kg target records WEIGHT_GOAL_REACHED: %s',
    async (previous, current, target, expected) => {
      prismaMock.user.findFirstOrThrow.mockResolvedValue({
        id: 1,
        targetWeight: target,
      });
      prismaMock.weightLog.findFirst.mockResolvedValue(
        previous === undefined ? null : { weight: previous },
      );
      prismaMock.weightLog.create.mockResolvedValue({
        id: 1,
        weight: current,
      });

      await service.logWeight(1, current);

      const goalCalls = activityServiceMock.record.mock.calls.filter(
        (call: unknown[]) => call[1] === ActivityType.WEIGHT_GOAL_REACHED,
      );
      expect(goalCalls.length).toBe(expected ? 1 : 0);
    },
  );

  it('should not record a weight goal when the user has no target', async () => {
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      targetWeight: null,
    });
    prismaMock.weightLog.findFirst.mockResolvedValue({ weight: 82 });
    prismaMock.weightLog.create.mockResolvedValue({ id: 1, weight: 70 });

    await service.logWeight(1, 70);

    expect(activityServiceMock.record).not.toHaveBeenCalledWith(
      1,
      ActivityType.WEIGHT_GOAL_REACHED,
      expect.anything(),
    );
  });

  it('should return weight history for a user', async () => {
    const entries = [
      { id: 2, weight: 76, bodyFat: null, loggedAt: new Date() },
      { id: 1, weight: 75.5, bodyFat: null, loggedAt: new Date() },
    ];
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.weightLog.findMany.mockResolvedValue(entries);

    const result = await service.getWeightHistory(1);

    expect(prismaMock.weightLog.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: { loggedAt: 'desc' },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
        loggedAt: true,
      },
    });
    expect(result).toEqual(entries);
  });

  it('should throw NotFoundException if user not found when getting weight history', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getWeightHistory(99)).rejects.toThrow(
      'User not found',
    );
  });

  describe('deleteWeight', () => {
    it('should delete the entry and its linked activities', async () => {
      const deleted = { id: 5, weight: 75 };
      prismaMock.weightLog.findUnique.mockResolvedValue({ id: 5, userId: 1 });
      prismaMock.weightLog.delete.mockResolvedValue(deleted);

      const result = await service.deleteWeight(1, 5);

      expect(prismaMock.weightLog.delete).toHaveBeenCalledWith({
        where: { id: 5 },
        select: {
          id: true,
          weight: true,
          bodyFat: true,
          fatFreeMass: true,
          bodyWater: true,
          muscleMass: true,
          loggedAt: true,
        },
      });

      expect(activityServiceMock.removeByWeightLog).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual(deleted);
    });

    it('should throw NotFoundException when the entry does not exist', async () => {
      prismaMock.weightLog.findUnique.mockResolvedValue(null);

      await expect(service.deleteWeight(1, 99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaMock.weightLog.delete).not.toHaveBeenCalled();

      expect(activityServiceMock.removeByWeightLog).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException and delete nothing when the entry belongs to another user', async () => {
      prismaMock.weightLog.findUnique.mockResolvedValue({ id: 5, userId: 2 });

      await expect(service.deleteWeight(1, 5)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaMock.weightLog.delete).not.toHaveBeenCalled();

      expect(activityServiceMock.removeByWeightLog).not.toHaveBeenCalled();
    });
  });

  describe('deleteAvatar', () => {
    it('should delete the file from storage and clear avatarUrl', async () => {
      supabaseMock.deleteAvatar.mockResolvedValue(undefined);
      prismaMock.user.update.mockResolvedValue({ id: 1, avatarUrl: null });

      await service.deleteAvatar(1);

      expect(supabaseMock.deleteAvatar).toHaveBeenCalledWith(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { avatarUrl: null },
        select: { id: true, username: true, name: true, avatarUrl: true },
      });
    });

    it('should not clear avatarUrl if storage deletion throws', async () => {
      supabaseMock.deleteAvatar.mockRejectedValue(new Error('Storage error'));

      await expect(service.deleteAvatar(1)).rejects.toThrow('Storage error');
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
