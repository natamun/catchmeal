import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('messages')
  send(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SendMessageDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only send messages as yourself');
    }
    return this.messagesService.send(userId, dto.toUserId, dto.content);
  }

  @Get('messages/:otherUserId')
  getConversation(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only view your own conversations');
    }
    return this.messagesService.getConversation(userId, otherUserId);
  }
}
