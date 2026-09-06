import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FoodItemsModule } from './food-items/food-items.module';

@Module({
  imports: [ConfigModule.forRoot(), FoodItemsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
