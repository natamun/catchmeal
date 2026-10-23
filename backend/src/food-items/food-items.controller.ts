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
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemsService } from './food-items.service';

@ApiTags('food-items')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@ApiForbiddenResponse({ description: 'Accès interdit' })
@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class FoodItemsController {
  constructor(private readonly foodItemsService: FoodItemsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @ApiCreatedResponse({ description: 'Aliment créé' })
  @Post('food-items')
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFoodItemDto,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.create(userId, dto);
  }

  @ApiOkResponse({ description: 'Liste des aliments' })
  @Get('food-items')
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.findAll(userId);
  }

  @ApiOkResponse({ description: 'Détail d’un aliment' })
  @ApiNotFoundResponse({ description: 'Aliment introuvable' })
  @Get('food-items/:id')
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.foodItemsService.findOne(userId, id);
  }

  @ApiOkResponse({ description: 'Aliment mis à jour' })
  @ApiNotFoundResponse({ description: 'Aliment introuvable' })
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

  @ApiOkResponse({ description: 'Aliment archivé' })
  @ApiNotFoundResponse({ description: 'Aliment introuvable' })
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
