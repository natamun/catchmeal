import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthenticatedSocket } from './authenticated-socket';
import { WsAuthService } from './ws-auth.service';

@WebSocketGateway()
export class WsAuthGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly wsAuthService: WsAuthService) {}

  afterInit(server: Server) {
    server.use((socket: AuthenticatedSocket, next) => {
      void this.wsAuthService.authenticate(socket, next);
    });
  }
}
