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
      update: jest.fn(),
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
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    await service.findById(1);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should find a user by username', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'alice' });

    await service.findUserByName('alice');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'alice' },
    });
  });
});
