import { Module } from '@nestjs/common';

import { ActivityModule } from '../activity/activity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
