import { UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse } from 'cookie';
import { DefaultEventsMap, Server, Socket } from 'socket.io';

import { UsersService } from '../users/users.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

type ChatSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { userId: number }
>;

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
})
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: ChatSocket, next) => {
      try {
        const cookies = parse(socket.handshake.headers.cookie ?? '');
        const token = cookies.access_token;
        if (!token) throw new Error('No token');

        const payload = this.jwtService.verify<{ sub: number }>(token);
        const user = await this.usersService.findById(payload.sub);
        if (!user) throw new Error('User not found');

        socket.data.userId = user.id;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: ChatSocket) {
    void client.join(`user:${client.data.userId}`);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage('message:send')
  async handleSend(
    @ConnectedSocket() client: ChatSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId = client.data.userId;
    try {
      const message = await this.messagesService.send(
        userId,
        dto.toUserId,
        dto.content,
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
