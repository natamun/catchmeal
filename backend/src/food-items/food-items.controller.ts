import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemsService } from './food-items.service';

@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class FoodItemsController {
  constructor(private readonly foodItemsService: FoodItemsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @Post('food-items')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFoodItemDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.create(userId, dto);
  }

  @Get('food-items')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.findAll(userId);
  }

  @Get('food-items/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.findOne(userId, id);
  }

  @Patch('food-items/:id')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFoodItemDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.update(userId, id, dto);
  }

  @Delete('food-items/:id')
  archive(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.archive(userId, id);
  }
}
