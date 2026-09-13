import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

@Module({
  imports: [PrismaModule],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}
