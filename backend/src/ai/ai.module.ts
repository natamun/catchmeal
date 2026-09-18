import { Module } from '@nestjs/common';

import { MealsModule } from '../meals/meals.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [MealsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
