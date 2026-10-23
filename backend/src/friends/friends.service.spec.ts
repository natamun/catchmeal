import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FriendsGateway } from './friends.gateway';
import { FriendsService } from './friends.service';

describe('FriendsService', () => {
  let service: FriendsService;

  const prismaMock = {
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
    friend: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const friendsGatewayMock = {
    notifyRequestReceived: jest.fn(),
    notifyRequestAccepted: jest.fn(),
    notifyFriendshipRemoved: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: FriendsGateway, useValue: friendsGatewayMock },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendRequest', () => {
    it('should reject sending a request to yourself', async () => {
      await expect(service.sendRequest(1, 1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.friend.findFirst).not.toHaveBeenCalled();
    });

    it('should create a pending request and notify the recipient', async () => {
      const sender = { id: 1, username: 'alice', name: 'Alice' };
      prismaMock.friend.findFirst.mockResolvedValue(null);
      prismaMock.friend.create.mockResolvedValue({
        id: 7,
        userId: 1,
        friendId: 2,
        user: sender,
      });

      await service.sendRequest(1, 2);

      expect(prismaMock.friend.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: 1, friendId: 2 },
            { userId: 2, friendId: 1 },
          ],
        },
      });
      expect(prismaMock.friend.create).toHaveBeenCalledWith({
        data: { userId: 1, friendId: 2, status: 'PENDING' },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
      });
      expect(friendsGatewayMock.notifyRequestReceived).toHaveBeenCalledWith(2, {
        requestId: 7,
        from: sender,
      });
    });

    it('should reject if a relationship already exists in either direction', async () => {
      prismaMock.friend.findFirst.mockResolvedValue({
        id: 1,
        userId: 2,
        friendId: 1,
      });

      await expect(service.sendRequest(1, 2)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prismaMock.friend.create).not.toHaveBeenCalled();
      expect(friendsGatewayMock.notifyRequestReceived).not.toHaveBeenCalled();
    });

    it('should reject on a duplicate-key race condition', async () => {
      prismaMock.friend.findFirst.mockResolvedValue(null);
      prismaMock.friend.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: '7.9.1',
        }),
      );

      await expect(service.sendRequest(1, 2)).rejects.toThrow(
        'Demande déjà envoyée à cet utilisateur',
      );
      expect(friendsGatewayMock.notifyRequestReceived).not.toHaveBeenCalled();
    });

    it('should lock the pair of users in the same order whoever sends first', async () => {
      prismaMock.friend.findFirst.mockResolvedValue(null);
      prismaMock.friend.create.mockResolvedValue({
        id: 9,
        user: { id: 1, username: 'alice', name: 'Alice', avatarUrl: null },
      });

      await service.sendRequest(1, 2);
      await service.sendRequest(2, 1);

      const calls = prismaMock.$executeRaw.mock.calls as [
        unknown,
        number,
        number,
      ][];
      expect([calls[0][1], calls[0][2]]).toEqual([1, 2]);
      expect([calls[1][1], calls[1][2]]).toEqual([1, 2]);
    });
  });

  describe('acceptRequest', () => {
    it('should accept a pending request and notify the sender', async () => {
      const acceptor = { id: 2, username: 'bob', name: 'Bob' };
      prismaMock.friend.update.mockResolvedValue({
        id: 5,
        userId: 1,
        friendId: 2,
        status: 'ACCEPTED',
        friendUser: acceptor,
      });

      await service.acceptRequest(2, 5);

      expect(prismaMock.friend.update).toHaveBeenCalledWith({
        where: { id: 5, friendId: 2, status: 'PENDING' },
        data: { status: 'ACCEPTED' },
        include: {
          friendUser: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
      });
      expect(friendsGatewayMock.notifyRequestAccepted).toHaveBeenCalledWith(1, {
        friendshipId: 5,
        friend: acceptor,
      });
    });

    it('should propagate the non-found error when the request does not belong to the user', async () => {
      const notFound = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '7.9.1' },
      );
      prismaMock.friend.update.mockRejectedValue(notFound);

      await expect(service.acceptRequest(2, 5)).rejects.toBe(notFound);
      expect(friendsGatewayMock.notifyRequestAccepted).not.toHaveBeenCalled();
    });
  });

  describe('removeOrDecline', () => {
    it('should delete a friendship the user is part of and notify the other', async () => {
      prismaMock.friend.findFirst.mockResolvedValue({
        id: 5,
        userId: 1,
        friendId: 2,
      });
      prismaMock.friend.delete.mockResolvedValue({ id: 5 });

      await service.removeOrDecline(1, 5);

      expect(
        friendsGatewayMock.notifyFriendshipRemoved,
      ).toHaveBeenLastCalledWith(2, {
        friendshipId: 5,
      });

      await service.removeOrDecline(2, 5);

      expect(
        friendsGatewayMock.notifyFriendshipRemoved,
      ).toHaveBeenLastCalledWith(1, {
        friendshipId: 5,
      });

      expect(prismaMock.friend.delete).toHaveBeenCalledWith({
        where: {
          id: 5,
        },
      });
    });

    it('should reject when the friendship does not belong to the user', async () => {
      prismaMock.friend.findFirst.mockResolvedValue(null);

      await expect(service.removeOrDecline(1, 5)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.friend.delete).not.toHaveBeenCalled();
      expect(friendsGatewayMock.notifyFriendshipRemoved).not.toHaveBeenCalled();
    });
  });

  describe('listFriends', () => {
    it('should map each row to the other participant, regardless of direction', async () => {
      prismaMock.friend.findMany.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          friendId: 2,
          user: { id: 1 },
          friendUser: { id: 2 },
        },
        {
          id: 2,
          userId: 3,
          friendId: 1,
          user: { id: 3 },
          friendUser: { id: 1 },
        },
      ]);

      const result = await service.listFriends(1);

      expect(result).toEqual([
        { friendshipId: 1, friend: { id: 2 } },
        { friendshipId: 2, friend: { id: 3 } },
      ]);
    });
  });

  describe('listPendingReceived', () => {
    it('should list pending requests addressed to the user', async () => {
      prismaMock.friend.findMany.mockResolvedValue([
        { id: 1, user: { id: 3 } },
      ]);

      const result = await service.listPendingReceived(2);

      expect(prismaMock.friend.findMany).toHaveBeenCalledWith({
        where: { friendId: 2, status: 'PENDING' },
        include: {
          user: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
      });
      expect(result).toEqual([{ requestId: 1, from: { id: 3 } }]);
    });
  });

  describe('listPendingSent', () => {
    it('should list the ids of users this user has a pending request to', async () => {
      prismaMock.friend.findMany.mockResolvedValue([
        { friendId: 5 },
        { friendId: 8 },
      ]);

      const result = await service.listPendingSent(2);

      expect(prismaMock.friend.findMany).toHaveBeenCalledWith({
        where: { userId: 2, status: 'PENDING' },
        select: { friendId: true },
      });
      expect(result).toEqual([5, 8]);
    });
  });

  describe('getFriendIds', () => {
    it('should return the other side of each accepted friendship', async () => {
      prismaMock.friend.findMany.mockResolvedValue([
        { userId: 1, friendId: 2 },
        { userId: 3, friendId: 1 },
      ]);

      await expect(service.getFriendIds(1)).resolves.toEqual([2, 3]);
      expect(prismaMock.friend.findMany).toHaveBeenCalledWith({
        where: { status: 'ACCEPTED', OR: [{ userId: 1 }, { friendId: 1 }] },
      });
    });
  });
});
