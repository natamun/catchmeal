import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemsService } from './food-items.service';

@Controller('users/:userId')
export class FoodItemsController {
  constructor(private readonly foodItemsService: FoodItemsService) {}

  @Post('food-items')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFoodItemDto,
  ) {
    return this.foodItemsService.create(userId, dto);
  }

  @Get('food-items')
  findAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.foodItemsService.findAll(userId);
  }

  @Get('food-items/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.foodItemsService.findOne(userId, id);
  }

  @Patch('food-items/:id')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFoodItemDto,
  ) {
    return this.foodItemsService.update(userId, id, dto);
  }

  @Delete('food-items/:id')
  archive(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.foodItemsService.archive(userId, id);
  }
}
