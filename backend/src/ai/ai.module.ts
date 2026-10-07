import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { AiContextModule } from '../ai-context/ai-context.module';
import { DashboardAnalyticsModule } from '../dashboard-analytics/dashboard-analytics.module';
import { MealsModule } from '../meals/meals.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    MealsModule,
    DashboardAnalyticsModule,
    AiContextModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
