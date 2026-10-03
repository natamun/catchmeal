import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('dashboard')
  getDashboard(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
    @Query('from', new ParseDatePipe({ optional: true })) from?: Date,
    @Query('to', new ParseDatePipe({ optional: true })) to?: Date,
  ) {
    if (userId !== req.user.userId) {
      throw new ForbiddenException('You can only access your own dashboard');
    }

    const fromDate = from
      ? from
      : new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to
      ? to
      : new Date(new Date().setDate(new Date().getDate() + 1));
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);
    return this.analyticsService.getDashboard(userId, fromDate, toDate);
  }
}
