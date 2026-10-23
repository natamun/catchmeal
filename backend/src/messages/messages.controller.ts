import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@ApiTags('messages')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@ApiForbiddenResponse({ description: 'Accès interdit' })
@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiCreatedResponse({ description: 'Message envoyé' })
  @ApiBadRequestResponse({
    description: 'Requête invalide (message à soi-même)',
  })
  @ApiNotFoundResponse({ description: 'Activité introuvable' })
  @Post('messages')
  send(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SendMessageDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only send messages as yourself');
    }
    return this.messagesService.send(
      userId,
      dto.toUserId,
      dto.content,
      dto.activityId,
    );
  }

  @ApiOkResponse({ description: 'Messages non lus' })
  @Get('messages/unread')
  getUnread(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only view your own messages');
    }
    return this.messagesService.getUnreadSenderIds(userId);
  }

  @ApiOkResponse({ description: 'Conversation' })
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

  @ApiOkResponse({ description: 'Messages marqués comme lus' })
  @Patch('messages/:otherUserId/read')
  markRead(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('otherUserId', ParseIntPipe) otherUserId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only update your own messages');
    }
    return this.messagesService.markConversationRead(userId, otherUserId);
  }
}
