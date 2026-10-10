import { Module } from '@nestjs/common';

import { OpenFoodFactsController } from './open-food-facts.controller';
import { OpenFoodFactsService } from './open-food-facts.service';

@Module({
  controllers: [OpenFoodFactsController],
  providers: [OpenFoodFactsService],
})
export class OpenFoodFactsModule {}
