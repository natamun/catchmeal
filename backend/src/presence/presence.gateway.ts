import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { FriendsService } from '../friends/friends.service';
import { AuthenticatedSocket } from '../websocket/authenticated-socket';
import { PresenceService } from './presence.service';

@WebSocketGateway()
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly friendsService: FriendsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    const justCameOnline = this.presenceService.addConnection(
      userId,
      client.id,
    );
    if (!justCameOnline) return;

    const friendIds = await this.friendsService.getFriendIds(userId);
    friendIds.forEach((friendId) => {
      this.server.to(`user:${friendId}`).emit('presence:online', { userId });
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    const justWentOffline = this.presenceService.removeConnection(
      userId,
      client.id,
    );
    if (!justWentOffline) return;

    await this.presenceService.markOffline(userId);
    const friendIds = await this.friendsService.getFriendIds(userId);
    friendIds.forEach((friendId) => {
      this.server.to(`user:${friendId}`).emit('presence:offline', {
        userId,
        lastSeenAt: new Date().toISOString(),
      });
    });
  }
}
