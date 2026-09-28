import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@UseGuards(ThrottlerGuard)
@Controller('users/:userId')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  chat(@Param('userId', ParseIntPipe) userId: number, @Body() dto: ChatDto) {
    return this.aiService.chat(userId, dto.message);
  }
}
