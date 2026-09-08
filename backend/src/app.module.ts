import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { FoodItemsModule } from './food-items/food-items.module';

@Module({
  imports: [ConfigModule.forRoot(), FoodItemsModule, DashboardAnalyticsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
