import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAreFriends(userId: number, otherUserId: number) {
    const friendship = await this.prisma.friend.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { userId, friendId: otherUserId },
          { userId: otherUserId, friendId: userId },
        ],
      },
    });
    if (!friendship) {
      throw new ForbiddenException(
        'Vous devez être amis pour échanger des messages',
      );
    }
  }

  async send(userId: number, toUserId: number, content: string) {
    if (userId === toUserId) {
      throw new BadRequestException(
        'Impossible de vous envoyer un message à vous-même',
      );
    }
    await this.assertAreFriends(userId, toUserId);

    return this.prisma.message.create({
      data: { senderId: userId, receiverId: toUserId, content },
    });
  }

  async getConversation(userId: number, otherUserId: number) {
    await this.assertAreFriends(userId, otherUserId);

    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { sentAt: 'asc' },
    });
  }
}
