import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { AiContextService } from './ai-context.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@ApiTags('ai-context')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@Controller('users/:userId/ai-context')
@UseGuards(PassportJwtAuthGuard)
export class AiContextController {
  constructor(private readonly aiContextService: AiContextService) {}

  @Get('profile')
  @ApiOkResponse({ description: 'Profil utilisateur pour le contexte IA' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  getProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getProfile(userId);
  }

  @Get('weight-history')
  @ApiOkResponse({ description: 'Historique de poids pour le contexte IA' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  getWeightHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: RequestWithUser,
  ) {
    if (req!.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getWeightHistory(userId, from, to);
  }

  @Get('goal-settings')
  @ApiOkResponse({
    description: 'Paramètres des objectifs pour le contexte IA',
  })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  getGoalSettings(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: RequestWithUser,
  ) {
    if (req!.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getGoalSettings(userId, from, to);
  }

  @Get('food-items')
  @ApiOkResponse({ description: 'Aliments fréquents pour le contexte IA' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  getFrequentFoodItems(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req?: RequestWithUser,
  ) {
    if (req!.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI context');
    }
    return this.aiContextService.getFrequentFoodItems(userId);
  }
}
