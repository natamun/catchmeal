import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FoodItemsController } from './food-items.controller';
import { FoodItemsService } from './food-items.service';

@Module({
  imports: [PrismaModule],
  controllers: [FoodItemsController],
  providers: [FoodItemsService],
})
export class FoodItemsModule {}
