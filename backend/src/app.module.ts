import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { ActivityModule } from './activity/activity.module';
import { AdminModule } from './admin/admin.module';
import { AiContextModule } from './ai-context/ai-context.module';
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
import { OpenFoodFactsModule } from './open-food-facts/open-food-facts.module';
import { PresenceModule } from './presence/presence.module';
import { UsersModule } from './users/users.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // Set the rate limit to 100 req/min
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ConfigModule.forRoot(),
    FoodItemsModule,
    OpenFoodFactsModule,
    ActivityModule,

    AuthModule,
    MealsModule,
    DashboardAnalyticsModule,
    UsersModule,
    FriendsModule,
    GdprModule,
    MessagesModule,
    AdminModule,
    AiModule,
    AiContextModule,
    WebsocketModule,
    PresenceModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
