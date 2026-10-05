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
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway()
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: AuthenticatedSocket) {
    void client.join(`user:${client.data.userId}`);
  }

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
      return { error: err instanceof Error ? err.message : 'Erreur' };
    }
  }
}
