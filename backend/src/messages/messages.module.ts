import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [PrismaModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
