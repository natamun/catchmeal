import { DashboardAnalyticsService } from './dashboard-analytics.service';
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ParseDatePipe,
} from '@nestjs/common';

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
