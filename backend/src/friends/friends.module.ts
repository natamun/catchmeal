import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FriendsController } from './friends.controller';
import { FriendsGateway } from './friends.gateway';
import { FriendsService } from './friends.service';

@Module({
  imports: [PrismaModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsGateway],
  exports: [FriendsService],
})
export class FriendsModule {}
