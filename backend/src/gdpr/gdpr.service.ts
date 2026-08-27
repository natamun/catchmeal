import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Send confirmation email
    // TODO: replace with user.email once schema v2 is merged
    const userEmail = (user as any).email ?? null;
    if (userEmail) {
      await this.emailService.sendDataExportConfirmation(userEmail);
    }

    // Return all user data we currently have
    // This will grow as more tables are added to the schema
    return {
      exportedAt: new Date().toISOString(),
      data: {
        profile: user,
      },
    };
  }
}
