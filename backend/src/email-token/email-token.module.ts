import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { EmailTokenService } from './email-token.service';

@Module({
  imports: [PrismaModule],
  providers: [EmailTokenService],
  exports: [EmailTokenService],
})
export class EmailTokenModule {}
