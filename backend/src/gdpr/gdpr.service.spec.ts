import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { GdprService } from './gdpr.service';

describe('GdprService', () => {
  let service: GdprService;

  // The transaction callback runs against this tx mock
  const tx = {
    mealFoodItem: { deleteMany: jest.fn() },
    meal: { deleteMany: jest.fn() },
    foodItem: { deleteMany: jest.fn() },
    weightLog: { deleteMany: jest.fn() },
    goalSetting: { deleteMany: jest.fn() },
    emailToken: { deleteMany: jest.fn() },
    message: { updateMany: jest.fn() },
    activity: { deleteMany: jest.fn() },
    friend: { deleteMany: jest.fn() },
    user: { update: jest.fn() },
  };

  const prismaMock = {
    $transaction: jest.fn(),
    user: { findUnique: jest.fn() },
  };

  const emailServiceMock = {
    sendDataExportConfirmation: jest.fn(),
    sendAccountDeletionConfirmation: jest.fn(),
  };

  const supabaseMock = { deleteAvatar: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      (cb: (t: typeof tx) => unknown) => cb(tx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GdprService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: SupabaseService, useValue: supabaseMock },
      ],
    }).compile();

    service = module.get<GdprService>(GdprService);
  });

  describe('deleteAccount', () => {
    const activeUser = {
      id: 5,
      email: 'alice@example.com',
      avatarUrl: null,
    };

    it('erases all personal data in a single transaction', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.mealFoodItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(tx.meal.deleteMany).toHaveBeenCalledWith({ where: { userId: 5 } });
      expect(tx.foodItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(tx.weightLog.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(tx.goalSetting.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(tx.emailToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
      expect(tx.activity.deleteMany).toHaveBeenCalledWith({
        where: { userId: 5 },
      });
    });

    it('detaches quoted activities from kept messages before deleting them', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5);

      expect(tx.message.updateMany).toHaveBeenCalledWith({
        where: { activity: { userId: 5 } },
        data: { activityId: null },
      });
    });

    it('drops only non-accepted friend requests, keeping accepted friendships', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5);

      expect(tx.friend.deleteMany).toHaveBeenCalledWith({
        where: {
          status: { not: 'ACCEPTED' },
          OR: [{ userId: 5 }, { friendId: 5 }],
        },
      });
    });

    it('anonymises the identity and sets deletedAt', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5);

      const calls = tx.user.update.mock.calls as [
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
    });

    it('sends the confirmation email on self-deletion', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      const result = await service.deleteAccount(5);

      expect(
        emailServiceMock.sendAccountDeletionConfirmation,
      ).toHaveBeenCalledWith('alice@example.com');
      expect(result).toEqual({ message: 'Account successfully deleted' });
    });

    it('skips the email when called by admin (sendEmail = false)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5, false);

      expect(
        emailServiceMock.sendAccountDeletionConfirmation,
      ).not.toHaveBeenCalled();
    });

    it('still succeeds when the confirmation email fails', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);
      emailServiceMock.sendAccountDeletionConfirmation.mockRejectedValue(
        new Error('SMTP down'),
      );

      await expect(service.deleteAccount(5)).resolves.toEqual({
        message: 'Account successfully deleted',
      });
    });

    it('deletes the avatar file when the user has one', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...activeUser,
        avatarUrl: 'https://cdn/avatar.png',
      });

      await service.deleteAccount(5);

      expect(supabaseMock.deleteAvatar).toHaveBeenCalledWith(5);
    });

    it('does not touch Supabase when there is no avatar', async () => {
      prismaMock.user.findUnique.mockResolvedValue(activeUser);

      await service.deleteAccount(5);

      expect(supabaseMock.deleteAvatar).not.toHaveBeenCalled();
    });

    it('throws NotFoundException and changes nothing when the user does not exist', async () => {
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
