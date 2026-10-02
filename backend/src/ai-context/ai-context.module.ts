import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { AiContextController } from './ai-context.controller';
import { AiContextService } from './ai-context.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiContextController],
  providers: [AiContextService],
})
export class AiContextModule {}
