import { Test, TestingModule } from '@nestjs/testing';

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
      findMany: jest.fn(),
    },
  };

  const supabaseMock = {
    uploadAvatar: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SupabaseService, useValue: supabaseMock },
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
      note: null,
      loggedAt: new Date(),
    };
    prismaMock.user.findFirstOrThrow.mockResolvedValue({ id: 1 });
    prismaMock.weightLog.create.mockResolvedValue(entry);

    const result = await service.logWeight(1, 75.5);

    expect(prismaMock.weightLog.create).toHaveBeenCalledWith({
      data: { userId: 1, weight: 75.5, bodyFat: undefined, note: undefined },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        note: true,
        loggedAt: true,
      },
    });
    expect(result).toEqual(entry);
  });

  it('should return weight history for a user', async () => {
    const entries = [
      { id: 2, weight: 76, bodyFat: null, note: null, loggedAt: new Date() },
      { id: 1, weight: 75.5, bodyFat: null, note: null, loggedAt: new Date() },
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
        note: true,
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
});
