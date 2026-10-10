import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseDatePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';

@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @Post('meals')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateMealDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.create(userId, dto);
  }

  @Get('meals')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
    @Query('logged') loggedRaw?: string,
    @Query('date', new ParseDatePipe({ optional: true })) date?: Date,
  ) {
    this.checkOwnership(userId, req.user.userId);
    let logged: boolean | undefined;
    if (loggedRaw !== undefined) {
      if (loggedRaw !== 'true' && loggedRaw !== 'false')
        throw new BadRequestException('logged must be true or false');
      logged = loggedRaw === 'true';
    }
    return this.mealsService.findAll(userId, logged, date);
  }

  @Get('meals/range')
  findRange(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
    @Query('from', new ParseDatePipe({ optional: true })) from?: Date,
    @Query('to', new ParseDatePipe({ optional: true })) to?: Date,
  ) {
    this.checkOwnership(userId, req.user.userId);
    const fromDate =
      from ?? new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to ?? new Date();
    return this.mealsService.findRange(userId, fromDate, toDate);
  }

  @Get('meals/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.findOne(userId, id);
  }

  @Patch('meals/:id')
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.update(userId, id, dto);
  }

  @Delete('meals/:id')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.remove(userId, id);
  }
}
