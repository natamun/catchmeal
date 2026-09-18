import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';

@Controller('users/:userId')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post('meals')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateMealDto,
  ) {
    return this.mealsService.create(userId, dto);
  }

  @Get('meals')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('logged', new ParseBoolPipe({ optional: true })) logged?: boolean,
  ) {
    return this.mealsService.findAll(userId, logged);
  }

  @Get('meals/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealsService.findOne(userId, id);
  }

  @Patch('meals/:id')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealDto,
  ) {
    return this.mealsService.update(userId, id, dto);
  }

  @Delete('meals/:id')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealsService.remove(userId, id);
  }
}
