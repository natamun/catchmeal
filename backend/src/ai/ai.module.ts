import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { MealsModule } from '../meals/meals.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    MealsModule,
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
