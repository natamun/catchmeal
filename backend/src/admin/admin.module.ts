import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PresenceModule } from '../presence/presence.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, PresenceModule],
  controllers: [AdminController],
  providers: [AdminService, Reflector],
})
export class AdminModule {}
