import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let service: PresenceService;

  const prismaMock = {
    friend: { findMany: jest.fn() },
    user: { update: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PresenceService>(PresenceService);
  });

  describe('connection tracking', () => {
    it('should consider a user offline by default', () => {
      expect(service.isOnline(1)).toBe(false);
    });

    it('should report the first connection of a user as "just came online"', () => {
      expect(service.addConnection(1, 'socket-a')).toBe(true);
      expect(service.isOnline(1)).toBe(true);
    });

    it('should not report a second connection (another tab) as "just came online"', () => {
      service.addConnection(1, 'socket-a');
      expect(service.addConnection(1, 'socket-b')).toBe(false);
    });

    it('should stay online while at least one connection remains', () => {
      service.addConnection(1, 'socket-a');
      service.addConnection(1, 'socket-b');
      expect(service.removeConnection(1, 'socket-a')).toBe(false);
      expect(service.isOnline(1)).toBe(true);
    });

    it('should report "just went offline" when the last connection closes', () => {
      service.addConnection(1, 'socket-a');
      service.addConnection(1, 'socket-b');
      service.removeConnection(1, 'socket-a');
      expect(service.removeConnection(1, 'socket-b')).toBe(true);
      expect(service.isOnline(1)).toBe(false);
    });

    it('should ignore the removal of a user that has no connection', () => {
      expect(service.removeConnection(99, 'socket-x')).toBe(false);
    });
  });

  describe('markOffline', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should store the current time as lastSeenAt', async () => {
      const now = new Date('2026-10-04T10:00:00.000Z');
      jest.useFakeTimers().setSystemTime(now);
      prismaMock.user.update.mockResolvedValue({});

      await service.markOffline(7);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { lastSeenAt: now },
      });
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

  describe('getFriendsPresence', () => {
    it('should combine live presence with lastSeenAt for offline friends only', async () => {
      const seen = new Date('2026-10-03T08:00:00.000Z');
      prismaMock.friend.findMany.mockResolvedValue([
        { userId: 1, friendId: 2 },
        { userId: 1, friendId: 3 },
        { userId: 1, friendId: 4 },
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { id: 3, lastSeenAt: seen },
        { id: 4, lastSeenAt: null },
      ]);
      service.addConnection(2, 'socket-2');

      const result = await service.getFriendsPresence(1);

      expect(result).toEqual([
        { userId: 2, online: true, lastSeenAt: null },
        { userId: 3, online: false, lastSeenAt: seen },
        { userId: 4, online: false, lastSeenAt: null },
      ]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: [3, 4] } },
        select: { id: true, lastSeenAt: true },
      });
    });

    it('should not query lastSeenAt when every friend is online', async () => {
      prismaMock.friend.findMany.mockResolvedValue([
        { userId: 1, friendId: 2 },
      ]);
      service.addConnection(2, 'socket-2');

      await service.getFriendsPresence(1);

      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });
  });
});
