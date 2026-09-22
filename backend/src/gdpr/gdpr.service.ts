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
      include: {
        meal: {
          include: { items: true },
        },
        weightLogs: true,
        goalSettings: true,
        senderMessage: true,
        receiverMessage: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Send confirmation email
    await this.emailService.sendDataExportConfirmation(user.email);

    // Return all personal data — passwords are excluded for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeProfile } = user;

    return {
      exportedAt: new Date().toISOString(),
      data: {
        profile: safeProfile,
      },
    };
  }

  async deleteAccount(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Save email before anonymizing — needed for confirmation email
    const userEmail = user.email;

    // Soft delete + anonymize all personally identifiable information
    // Preserves relational integrity while complying with GDPR
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: `deleted_user_${userId}`,
        name: 'Deleted User',
        email: `deleted_${userId}@deleted.invalid`,
        passwordHash: '',
      },
    });

    // Send confirmation to the original email address
    await this.emailService.sendAccountDeletionConfirmation(userEmail);

    return { message: 'Account successfully deleted' };
  }
}
