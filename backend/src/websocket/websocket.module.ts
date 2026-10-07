import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { WsAuthGateway } from './ws-auth.gateway';
import { WsAuthService } from './ws-auth.service';

@Module({
  imports: [UsersModule],
  providers: [WsAuthService, WsAuthGateway],
})
export class WebsocketModule {}
