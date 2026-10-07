import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard, ThrottlerGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  chat(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ChatDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException(
        'You can only use the chat for your own account',
      );
    }
    return this.aiService.chat(userId, dto.message);
  }
}
