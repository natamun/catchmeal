import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ActivityService } from '../activity/activity.service';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const WITH_ACTIVITY = {
  activity: {
    include: {
      user: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
  },
} satisfies Prisma.MessageInclude;

type MessageWithActivity = Prisma.MessageGetPayload<{
  include: typeof WITH_ACTIVITY;
}>;

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

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

  private toMessageDto(message: MessageWithActivity) {
    const { activity, ...rest } = message;
    return {
      ...rest,
      activity: activity ? this.activityService.toFeedItem(activity) : null,
    };
  }

  async send(
    userId: number,
    toUserId: number,
    content: string,
    activityId?: number,
  ) {
    if (userId === toUserId) {
      throw new BadRequestException(
        'Impossible de vous envoyer un message à vous-même',
      );
    }

    // No messages to or from a deleted account. We check both the sender and
    // the recipient: the HTTP guard already blocks a deleted sender, but a
    // websocket is only authenticated on connect, so a user deleted while their
    // socket is still open could otherwise keep sending. send() is the single
    // path for both transports, so this one check covers HTTP and websocket.
    const [sender, recipient] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { deletedAt: true },
      }),
      this.prisma.user.findUnique({
        where: { id: toUserId },
        select: { deletedAt: true },
      }),
    ]);
    if (!sender || sender.deletedAt) {
      throw new ForbiddenException('Votre compte a été supprimé');
    }
    if (!recipient || recipient.deletedAt) {
      throw new ForbiddenException(
        'Ce compte a été supprimé, vous ne pouvez plus lui écrire',
      );
    }

    await this.assertAreFriends(userId, toUserId);

    if (activityId !== undefined) {
      const activity = await this.prisma.activity.findFirst({
        where: { id: activityId, userId: toUserId },
        select: { id: true },
      });
      if (!activity) {
        throw new NotFoundException('Activité introuvable');
      }
    }

    const message = await this.prisma.message.create({
      data: { senderId: userId, receiverId: toUserId, content, activityId },
      include: WITH_ACTIVITY,
    });

    return this.toMessageDto(message);
  }

  async getConversation(userId: number, otherUserId: number) {
    await this.assertAreFriends(userId, otherUserId);

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { sentAt: 'asc' },
      include: WITH_ACTIVITY,
    });

    return messages.map((message) => this.toMessageDto(message));
  }

  async getUnreadSenderIds(userId: number): Promise<number[]> {
    const rows = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: userId, readAt: null },
    });
    return rows.map((row) => row.senderId);
  }

  async markConversationRead(userId: number, otherUserId: number) {
    await this.assertAreFriends(userId, otherUserId);

    const { count } = await this.prisma.message.updateMany({
      where: { receiverId: userId, senderId: otherUserId, readAt: null },
      data: { readAt: new Date() },
    });
    return { count };
  }
}
