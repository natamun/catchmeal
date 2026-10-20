import { createHash } from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailTokenType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { EmailTokenService } from './email-token.service';

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

describe('EmailTokenService', () => {
  let service: EmailTokenService;

  const prismaMock = {
    $transaction: jest.fn(),
    emailToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const now = new Date('2026-10-20T10:00:00.000Z');
  const HOUR_MS = 60 * 60 * 1000;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTokenService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<EmailTokenService>(EmailTokenService);
    jest.useFakeTimers({ now });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    const createdData = () => {
      const calls = prismaMock.emailToken.create.mock.calls as [
        {
          data: {
            userId: number;
            type: string;
            tokenHash: string;
            expiresAt: Date;
          };
        },
      ][];
      return calls[0][0].data;
    };

    it('should return a random token and store only its hash', async () => {
      const token = await service.create(1, EmailTokenType.VERIFY_EMAIL);

      const data = createdData();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(data.tokenHash).toBe(sha256(token));
      expect(data.tokenHash).not.toBe(token);
      expect(data.userId).toBe(1);
      expect(data.type).toBe(EmailTokenType.VERIFY_EMAIL);
    });

    it('should expire a verification token after 24 hours', async () => {
      await service.create(1, EmailTokenType.VERIFY_EMAIL);

      expect(createdData().expiresAt).toEqual(
        new Date(now.getTime() + 24 * HOUR_MS),
      );
    });

    it('should discard the previous unused tokens of the same user and type', async () => {
      await service.create(1, EmailTokenType.VERIFY_EMAIL);

      expect(prismaMock.emailToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1, type: EmailTokenType.VERIFY_EMAIL, usedAt: null },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should generate a different token each time', async () => {
      const first = await service.create(1, EmailTokenType.VERIFY_EMAIL);
      const second = await service.create(1, EmailTokenType.VERIFY_EMAIL);

      expect(first).not.toBe(second);
    });
  });

  describe('consume', () => {
    const record = (overrides: Record<string, unknown> = {}) => ({
      id: 5,
      userId: 1,
      type: EmailTokenType.VERIFY_EMAIL,
      expiresAt: new Date(now.getTime() + HOUR_MS),
      usedAt: null,
      ...overrides,
    });

    it('should look the token up by its hash', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(null);

      await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(prismaMock.emailToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: sha256('abc') },
      });
    });

    it('should report an unknown token as invalid', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(null);

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'invalid' });
      expect(prismaMock.emailToken.updateMany).not.toHaveBeenCalled();
    });

    it('should report a token of another type as invalid', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(
        record({ type: 'RESET_PASSWORD' }),
      );

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'invalid' });
      expect(prismaMock.emailToken.updateMany).not.toHaveBeenCalled();
    });

    it('should report an expired token as expired', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(
        record({ expiresAt: new Date(now.getTime() - 1) }),
      );

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'expired' });
      expect(prismaMock.emailToken.updateMany).not.toHaveBeenCalled();
    });

    it('should report an already used token as used, even if it is expired', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(
        record({ usedAt: now, expiresAt: new Date(now.getTime() - HOUR_MS) }),
      );

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'used', userId: 1 });
      expect(prismaMock.emailToken.updateMany).not.toHaveBeenCalled();
    });

    it('should mark a valid token as used and return its user', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(record());
      prismaMock.emailToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'valid', userId: 1 });
      expect(prismaMock.emailToken.updateMany).toHaveBeenCalledWith({
        where: { id: 5, usedAt: null },
        data: { usedAt: now },
      });
    });

    it('should report used when another request consumed the token first', async () => {
      prismaMock.emailToken.findUnique.mockResolvedValue(record());
      prismaMock.emailToken.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.consume('abc', EmailTokenType.VERIFY_EMAIL);

      expect(result).toEqual({ status: 'used', userId: 1 });
    });
  });
});
