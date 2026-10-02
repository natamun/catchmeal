import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { AiContextService } from './ai-context.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@Controller('users/:userId/ai-context')
@UseGuards(PassportJwtAuthGuard)
export class AiContextController {
  constructor(private readonly aiContextService: AiContextService) {}

  @Get('profile')
  getProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getProfile(userId);
  }

  @Get('weight-history')
  getWeightHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: RequestWithUser,
  ) {
    if (req!.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getWeightHistory(userId, from, to);
  }
}
