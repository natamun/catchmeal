import { Module } from '@nestjs/common';

import { AvatarProxyController } from './avatar-proxy.controller';

@Module({
  controllers: [AvatarProxyController],
})
export class AvatarProxyModule {}
