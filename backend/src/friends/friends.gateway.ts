import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

type UserSummary = { id: number; username: string; name: string };

@WebSocketGateway()
export class FriendsGateway {
  @WebSocketServer()
  server: Server;

  notifyRequestReceived(
    toUserId: number,
    payload: { requestId: number; from: UserSummary },
  ) {
    this.server.to(`user:${toUserId}`).emit('friend:request', payload);
  }

  notifyRequestAccepted(
    toUserId: number,
    payload: { friendshipId: number; friend: UserSummary },
  ) {
    this.server.to(`user:${toUserId}`).emit('friend:accepted', payload);
  }

  notifyFriendshipRemoved(toUserId: number, payload: { friendshipId: number }) {
    this.server.to(`user:${toUserId}`).emit('friend:removed', payload);
  }
}
