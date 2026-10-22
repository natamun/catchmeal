import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { PresenceService } from './presence.service';

@ApiTags('presence')
@ApiCookieAuth('jwt')
@ApiResponse({ status: 401, description: 'Non authentifié' })
@Controller('presence')
@UseGuards(PassportJwtAuthGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get()
  getFriendsPresence(@Req() req: Request & { user: { userId: number } }) {
    return this.presenceService.getFriendsPresence(req.user.userId);
  }
}
