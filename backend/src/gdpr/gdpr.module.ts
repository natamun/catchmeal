import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [EmailModule, PrismaModule, SupabaseModule],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [GdprService],
})
export class GdprModule {}
