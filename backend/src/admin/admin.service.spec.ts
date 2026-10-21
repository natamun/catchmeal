import { ConflictException } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import { PresenceService } from '../presence/presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const prismaMock = { user: { update: jest.fn() } };
  const service = new AdminService(
    prismaMock as unknown as PrismaService,
    {} as PresenceService,
  );

  beforeEach(() => {
    prismaMock.user.update.mockReset();
  });

  describe('updateUser', () => {
    it('should update only the given fields', async () => {
      prismaMock.user.update.mockResolvedValue({
        id: 7,
        username: 'newtag',
        role: 'USER',
      });

      await service.updateUser(7, { username: 'newtag' });

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 7 },
          data: { username: 'newtag' },
        }),
      );
    });

    it('should throw a conflict when the username is already taken', async () => {
      prismaMock.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.9.1',
        }),
      );

      await expect(
        service.updateUser(7, { username: 'taken' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow any other error', async () => {
      const unexpected = new Error('database down');
      prismaMock.user.update.mockRejectedValue(unexpected);

      await expect(service.updateUser(7, { username: 'newtag' })).rejects.toBe(
        unexpected,
      );
    });
  });
});
