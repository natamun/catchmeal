import { Module } from '@nestjs/common';

import { FriendsModule } from '../friends/friends.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityController } from './activity.controller';
import { ActivityGateway } from './activity.gateway';
import { ActivityService } from './activity.service';

@Module({
  imports: [PrismaModule, FriendsModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityGateway],
  exports: [ActivityService],
})
export class ActivityModule {}
