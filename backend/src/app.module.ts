import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { FoodItemsModule } from './food-items/food-items.module';
import { FriendsModule } from './friends/friends.module';
import { GdprModule } from './gdpr/gdpr.module';
import { MealsModule } from './meals/meals.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';

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
    AdminModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
