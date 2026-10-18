import { Injectable, NotFoundException } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        passwordHash: true,
        id: true,
        role: true,
        deletedAt: true,
      },
      include: {
        meal: { include: { items: true } },
        foodItems: true,
        weightLogs: true,
        goalSettings: true,
        senderMessage: true,
        receiverMessage: true,
        activities: true,
        userFriend: {
          include: { friendUser: { select: { username: true, name: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    await this.emailService.sendDataExportConfirmation(user.email);

    return {
      exportedAt: new Date().toISOString(),
      data: { profile: user },
    };
  }

  async deleteAccount(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Save email before anonymizing — needed for the confirmation email
    const userEmail = user.email;

    // Soft delete + anonymize all PII while preserving relational integrity
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: `deleted_user_${userId}`,
        name: 'Deleted User',
        email: `deleted_${userId}@deleted.invalid`,
        passwordHash: '',
        deletedAt: new Date(),
      },
    });

    await this.emailService.sendAccountDeletionConfirmation(userEmail);

    return { message: 'Account successfully deleted' };
  }
}
