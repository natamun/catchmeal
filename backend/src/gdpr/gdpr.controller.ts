import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GdprService } from './gdpr.service';

@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export/:userId')
  exportUserData(@Param('userId', ParseIntPipe) userId: number) {
    return this.gdprService.exportUserData(userId);
  }
}
