import { DashboardAnalyticsService } from './dashboard-analytics.service';
import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';

@Controller('users/:userId')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('dashboard')
  getDashboard(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from
      ? new Date(from)
      : new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to ? new Date(to) : new Date();
    return this.analyticsService.getDashboard(userId, fromDate, toDate);
  }
}
