import { Controller, Delete, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { GdprService } from './gdpr.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@ApiTags('gdpr')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@Controller('gdpr')
@UseGuards(PassportJwtAuthGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @ApiOkResponse({ description: 'Export des données utilisateur' })
  @Get('export')
  exportUserData(@Request() req: RequestWithUser) {
    return this.gdprService.exportUserData(req.user.userId);
  }

  @ApiOkResponse({ description: 'Compte supprimé' })
  @Delete('account')
  deleteAccount(@Request() req: RequestWithUser) {
    return this.gdprService.deleteAccount(req.user.userId);
  }
}
