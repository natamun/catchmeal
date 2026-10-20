import { HttpException, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Server } from 'socket.io';

import type { AuthenticatedSocket } from '../websocket/authenticated-socket';
import { WsExceptionFilter } from '../websocket/ws-exception.filter';
import { WsThrottlerGuard } from '../websocket/ws-throttler.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway()
@SkipThrottle()
export class MessagesGateway {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: AuthenticatedSocket) {
    void client.join(`user:${client.data.userId}`);
  }

  @UseFilters(WsExceptionFilter)
  @UseGuards(WsThrottlerGuard)
  @SubscribeMessage('message:send')
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() rawDto: unknown,
  ) {
    const dto = plainToInstance(SendMessageDto, rawDto);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return { error: 'Message invalide.' };
    }

    const userId = client.data.userId;
    try {
      const message = await this.messagesService.send(
        userId,
        dto.toUserId,
        dto.content,
        dto.activityId,
      );
      this.server
        .to(`user:${dto.toUserId}`)
        .to(`user:${userId}`)
        .emit('message:new', message);
      return message;
    } catch (err) {
      if (err instanceof HttpException) {
        return { error: err.message };
      }
      this.logger.error(
        'Message not sent',
        err instanceof Error ? err.stack : String(err),
      );
      return { error: 'Message non envoyé, réessayez.' };
    }
  }
}
