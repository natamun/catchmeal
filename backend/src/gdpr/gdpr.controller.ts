import { Controller, Delete, Get, Request, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { GdprService } from './gdpr.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@Controller('gdpr')
@UseGuards(PassportJwtAuthGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  exportUserData(@Request() req: RequestWithUser) {
    return this.gdprService.exportUserData(req.user.userId);
  }

  @Delete('account')
  deleteAccount(@Request() req: RequestWithUser) {
    return this.gdprService.deleteAccount(req.user.userId);
  }
}
