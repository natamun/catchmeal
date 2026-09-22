import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PrismaService } from '../prisma/prisma.service';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [EmailModule],
  controllers: [GdprController],
  providers: [GdprService, PrismaService],
})
export class GdprModule {}
