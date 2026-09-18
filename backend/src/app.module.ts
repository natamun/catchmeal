import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { FoodItemsModule } from './food-items/food-items.module';
import { MealsModule } from './meals/meals.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FoodItemsModule,
    AuthModule,
    DashboardAnalyticsModule,
    MealsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
