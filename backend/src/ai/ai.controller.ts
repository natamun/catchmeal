import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('users/:userId')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  chat(@Param('userId', ParseIntPipe) userId: number, @Body() dto: ChatDto) {
    return this.aiService.chat(userId, dto.message, dto.conversationId);
  }
}
