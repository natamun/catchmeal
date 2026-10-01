import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { ActivityService } from './activity.service';

@Controller('users/:userId')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('activities')
  getFriendsFeed(@Param('userId', ParseIntPipe) userId: number) {
    return this.activityService.getFriendsFeed(userId);
  }
}
