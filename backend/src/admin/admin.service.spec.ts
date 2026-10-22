import { ConflictException } from '@nestjs/common';

import { GdprService } from '../gdpr/gdpr.service';
import { Prisma } from '../generated/prisma/client';
import { PresenceService } from '../presence/presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const prismaMock = { user: { update: jest.fn() } };
  const gdprMock = { deleteAccount: jest.fn() };
  const service = new AdminService(
    prismaMock as unknown as PrismaService,
    {} as PresenceService,
    gdprMock as unknown as GdprService,
  );

  beforeEach(() => {
    prismaMock.user.update.mockReset();
    gdprMock.deleteAccount.mockReset();
  });

  describe('deleteUser', () => {
    it('delegates to the GDPR full erasure without sending an email', async () => {
      gdprMock.deleteAccount.mockResolvedValue({
        message: 'Account successfully deleted',
      });

      await service.deleteUser(7);

      expect(gdprMock.deleteAccount).toHaveBeenCalledWith(7, false);
    });
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
