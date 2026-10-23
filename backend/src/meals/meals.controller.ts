import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsService } from './meals.service';
import { ParseDateOnlyPipe } from './pipes/parse-date-only.pipe';

@ApiTags('meals')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@ApiForbiddenResponse({ description: 'Accès interdit' })
@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @ApiCreatedResponse({ description: 'Repas créé' })
  @ApiBadRequestResponse({ description: 'Données de repas invalides' })
  @Post('meals')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateMealDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.create(userId, dto);
  }

  @ApiOkResponse({ description: 'Liste des repas' })
  @ApiBadRequestResponse({ description: 'Paramètre logged invalide' })
  @Get('meals')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
    @Query('logged') loggedRaw?: string,
    @Query('date', ParseDateOnlyPipe) date?: Date,
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

  @ApiOkResponse({ description: 'Repas sur une période' })
  @ApiBadRequestResponse({ description: 'Format de date invalide' })
  @Get('meals/range')
  findRange(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
    @Query('from', ParseDateOnlyPipe) from?: Date,
    @Query('to', ParseDateOnlyPipe) to?: Date,
  ) {
    this.checkOwnership(userId, req.user.userId);
    const fromDate =
      from ?? new Date(new Date().setDate(new Date().getDate() - 7));
    const toDate = to ?? new Date();
    return this.mealsService.findRange(userId, fromDate, toDate);
  }

  @ApiOkResponse({ description: 'Détail d’un repas' })
  @ApiNotFoundResponse({ description: 'Repas introuvable' })
  @Get('meals/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.mealsService.findOne(userId, id);
  }

  @ApiOkResponse({ description: 'Repas mis à jour' })
  @ApiBadRequestResponse({ description: 'Données de repas invalides' })
  @ApiNotFoundResponse({ description: 'Repas introuvable' })
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

  @ApiOkResponse({ description: 'Repas supprimé' })
  @ApiNotFoundResponse({ description: 'Repas introuvable' })
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
