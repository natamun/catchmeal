import { Module } from '@nestjs/common';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GdprController],
  providers: [GdprService, PrismaService],
})
export class GdprModule {}
