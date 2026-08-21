import { Controller, Get } from '@nestjs/common';
import { GdprService } from './gdpr.service';

@Controller('gdpr')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  exportUserData() {
    return this.gdprService.exportUserData();
  }
}
