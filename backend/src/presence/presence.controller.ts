import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import { PresenceService } from './presence.service';

@Controller('users/:userId')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get('presence')
  getFriendsPresence(@Param('userId', ParseIntPipe) userId: number) {
    return this.presenceService.getFriendsPresence(userId);
  }
}
