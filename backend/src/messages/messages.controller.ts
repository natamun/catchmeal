import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('users/:userId')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('messages')
  send(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(userId, dto.toUserId, dto.content);
  }

  @Get('messages/:otherUserId')
  getConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
  ) {
    return this.messagesService.getConversation(userId, otherUserId);
  }
}
