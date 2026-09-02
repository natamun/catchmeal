import {
  Controller,
  Get,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { DashboardAnalyticsService } from './dashboard-analytics.service';

@Controller('users/:userId')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('dashboard')
  getDashboard(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('from', new ParseDatePipe({ optional: true })) from?: Date,
    @Query('to', new ParseDatePipe({ optional: true })) to?: Date,
  ) {
    const fromDate = from
      ? from
      : new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to ? to : new Date();
    return this.analyticsService.getDashboard(userId, fromDate, toDate);
  }
}
