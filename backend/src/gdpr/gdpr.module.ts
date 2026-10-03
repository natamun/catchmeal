import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [EmailModule, PrismaModule],
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}
