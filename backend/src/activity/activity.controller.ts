import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { ActivityService } from './activity.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activities')
  getFriendsFeed(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only view your own activity feed');
    }
    return this.activityService.getFriendsFeed(userId);
  }
}
