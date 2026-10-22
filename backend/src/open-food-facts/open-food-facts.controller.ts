import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { OpenFoodFactsService } from './open-food-facts.service';

@ApiTags('open-food-facts')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@UseGuards(PassportJwtAuthGuard)
@Controller('users/:userId')
export class OpenFoodFactsController {
  constructor(private readonly openFoodFactsService: OpenFoodFactsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @Get('off-products/:barcode')
  lookup(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('barcode') barcode: string,
    @Request() req: { user: { userId: number } },
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.openFoodFactsService
      .lookup(barcode)
      .then((product) => ({ product }));
  }
}
