import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AdminModule } from './admin/admin.module';
import { AiContextModule } from './ai-context/ai-context.module';
import { AiModule } from './ai/ai.module';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { FoodItemsModule } from './food-items/food-items.module';
import { FriendsModule } from './friends/friends.module';
import { GdprModule } from './gdpr/gdpr.module';
import { MealsModule } from './meals/meals.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { UsersModule } from './users/users.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FoodItemsModule,
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
  providers: [AppService],
})
export class AppModule {}
