import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FoodItemsModule } from './food-items/food-items.module';

@Module({
  imports: [ConfigModule.forRoot(), FoodItemsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
