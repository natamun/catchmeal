import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;

  const prismaMock = {
    friend: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should reject sending a message to yourself', async () => {
      await expect(service.send(1, 1, 'hello')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.friend.findFirst).not.toHaveBeenCalled();
    });

    it('should reject when the two users are not friends', async () => {
      prismaMock.friend.findFirst.mockResolvedValue(null);

      await expect(service.send(1, 2, 'hello')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('should create a message when the two users are friends', async () => {
      prismaMock.friend.findFirst.mockResolvedValue({
        id: 5,
        status: 'ACCEPTED',
      });
      prismaMock.message.create.mockResolvedValue({ id: 10 });

      await service.send(1, 2, 'hello');

      expect(prismaMock.friend.findFirst).toHaveBeenCalledWith({
        where: {
          status: 'ACCEPTED',
          OR: [
            { userId: 1, friendId: 2 },
            { userId: 2, friendId: 1 },
          ],
        },
      });
      expect(prismaMock.message.create).toHaveBeenCalledWith({
        data: { senderId: 1, receiverId: 2, content: 'hello' },
      });
    });
  });

  describe('getConversation', () => {
    it('should reject when the two users are not friends', async () => {
      prismaMock.friend.findFirst.mockResolvedValue(null);

      await expect(service.getConversation(1, 2)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prismaMock.message.findMany).not.toHaveBeenCalled();
    });

    it('should return messages in both directions, oldest first', async () => {
      prismaMock.friend.findFirst.mockResolvedValue({
        id: 5,
        status: 'ACCEPTED',
      });
      prismaMock.message.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const result = await service.getConversation(1, 2);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: 1, receiverId: 2 },
            { senderId: 2, receiverId: 1 },
          ],
        },
        orderBy: { sentAt: 'asc' },
      });
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});
