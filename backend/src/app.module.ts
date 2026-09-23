import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { FoodItemsModule } from './food-items/food-items.module';
import { FriendsModule } from './friends/friends.module';
import { GdprModule } from './gdpr/gdpr.module';
import { MealsModule } from './meals/meals.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FoodItemsModule,
    AuthModule,
    MealsModule,
    DashboardAnalyticsModule,
    UsersModule,
    FriendsModule,
    GdprModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
