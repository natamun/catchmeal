import { createHash, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';

import { EmailTokenType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

const HOUR_MS = 60 * 60 * 1000;

const TOKEN_TTL_MS: Record<EmailTokenType, number> = {
  [EmailTokenType.VERIFY_EMAIL]: 24 * HOUR_MS,
};

export type TokenCheck =
  | { status: 'valid'; userId: number }
  | { status: 'used'; userId: number }
  | { status: 'expired' }
  | { status: 'invalid' };

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class EmailTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, type: EmailTokenType): Promise<string> {
    const token = randomBytes(32).toString('hex');

    await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({
        where: { userId, type, usedAt: null },
      }),
      this.prisma.emailToken.create({
        data: {
          userId,
          type,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
        },
      }),
    ]);

    return token;
  }

  async wasIssuedRecently(
    userId: number,
    type: EmailTokenType,
    withinMs: number,
  ): Promise<boolean> {
    const count = await this.prisma.emailToken.count({
      where: {
        userId,
        type,
        createdAt: { gt: new Date(Date.now() - withinMs) },
      },
    });

    return count > 0;
  }

  async consume(token: string, type: EmailTokenType): Promise<TokenCheck> {
    const record = await this.prisma.emailToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.type !== type) return { status: 'invalid' };

    if (record.usedAt) return { status: 'used', userId: record.userId };

    if (record.expiresAt <= new Date()) return { status: 'expired' };

    const { count } = await this.prisma.emailToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (count === 0) return { status: 'used', userId: record.userId };

    return { status: 'valid', userId: record.userId };
  }
}
