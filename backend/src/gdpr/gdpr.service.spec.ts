import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { GdprService } from './gdpr.service';

describe('GdprService', () => {
  let service: GdprService;

  const prismaMock = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    emailToken: {
      deleteMany: jest.fn(),
    },
  };

  const emailServiceMock = {
    sendDataExportConfirmation: jest.fn(),
    sendAccountDeletionConfirmation: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GdprService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<GdprService>(GdprService);
  });

  describe('deleteAccount', () => {
    it('should anonymize the account and delete its email tokens in one transaction', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'alice@example.com',
      });

      const result = await service.deleteAccount(5);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.emailToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });

      const calls = prismaMock.user.update.mock.calls as [
        {
          where: object;
          data: {
            username: string;
            name: string;
            email: string;
            passwordHash: string;
            deletedAt: Date;
          };
        },
      ][];
      const { where, data } = calls[0][0];
      expect(where).toEqual({ id: 5 });
      expect(data.username).toBe('deleted_user_5');
      expect(data.name).toBe('Deleted User');
      expect(data.email).toBe('deleted_5@deleted.invalid');
      expect(data.passwordHash).toBe('');
      expect(data.deletedAt).toBeInstanceOf(Date);
      expect(result).toEqual({ message: 'Account successfully deleted' });
    });

    it('should send the confirmation to the original address', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'alice@example.com',
      });

      await service.deleteAccount(5);

      expect(
        emailServiceMock.sendAccountDeletionConfirmation,
      ).toHaveBeenCalledWith('alice@example.com');
    });

    it('should throw NotFoundException and change nothing when the user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteAccount(5)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(
        emailServiceMock.sendAccountDeletionConfirmation,
      ).not.toHaveBeenCalled();
    });
  });
});
