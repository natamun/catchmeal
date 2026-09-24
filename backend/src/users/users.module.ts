import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsersSearchController } from './users-search.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController, UsersSearchController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
