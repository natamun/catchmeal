import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EmailTokenModule } from '../email-token/email-token.module';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { PassportAuthController } from './passport-auth.controller';
import { FortyTwoStrategy } from './strategies/forty-two.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FortyTwoStrategy,
    GoogleStrategy,
    GitHubStrategy,
  ],
  controllers: [PassportAuthController],
  imports: [
    UsersModule,
    EmailModule,
    EmailTokenModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
