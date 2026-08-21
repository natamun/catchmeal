import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
  constructor(private readonly prisma: PrismaService) {}

  async exportUserData(userId: number) {
    // Find the user in the database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
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
