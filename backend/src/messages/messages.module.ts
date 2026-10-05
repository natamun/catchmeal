import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
