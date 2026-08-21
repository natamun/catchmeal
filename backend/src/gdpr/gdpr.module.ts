import { Module } from '@nestjs/common';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}
