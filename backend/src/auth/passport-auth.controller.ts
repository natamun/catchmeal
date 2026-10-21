import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request as ExpressRequest, Response } from 'express';

import { UsersService } from '../users/users.service';
import { AuthService, type SignInData } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOAuthProfileDto } from './dto/complete-oauth-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { OptionalJwtAuthGuard } from './guards/optional-jwt.guard';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { PassportLocalGuard } from './guards/passport-local.guard';

type RequestWithUser = ExpressRequest & { user: SignInData };
type RequestWithOptionalUser = ExpressRequest & { user: SignInData | null };

type UserResponse = Omit<SignInData, 'userId'> & { userId: number };

function toUserResponse(data: SignInData): UserResponse {
  return {
    userId: data.userId,
    username: data.username,
    email: data.email,
    role: data.role,
    name: data.name,
    avatarUrl: data.avatarUrl,
    height: data.height,
    targetWeight: data.targetWeight,
    dailyCalorieGoal: data.dailyCalorieGoal,
    dailyProteinGoal: data.dailyProteinGoal,
    dailyCarbsGoal: data.dailyCarbsGoal,
    dailyFatGoal: data.dailyFatGoal,
    gender: data.gender,
    birthDate: data.birthDate,
    activityLevel: data.activityLevel,
    hasPassword: data.hasPassword,
    emailVerified: data.emailVerified,
  };
}

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const ALLOWED_FRONTEND_URL =
  process.env.FRONTEND_URL ?? 'http://localhost:5173';

function safeRedirectUrl(path: string = ''): string {
  try {
    const base = new URL(ALLOWED_FRONTEND_URL);
    return `${base.origin}${path}`;
  } catch {
    return `http://localhost:5173${path}`;
  }
}

@Controller('auth')
export class PassportAuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    if ('requiresVerification' in result) return result;
    this.setAuthCookie(res, result.accessToken);
    return toUserResponse(result);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Throttle({
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 20, ttl: 3_600_000 },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(
    @Request() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(request.user);
    this.setAuthCookie(res, result.accessToken);
    return toUserResponse(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME);
    return { success: true };
  }

  @Get('me')
  @UseGuards(OptionalJwtAuthGuard)
  getUserInfo(@Request() request: RequestWithOptionalUser) {
    return { user: request.user ? toUserResponse(request.user) : null };
  }

  @Patch('complete-profile')
  @UseGuards(PassportJwtAuthGuard)
  completeOAuthProfile(
    @Request() request: RequestWithUser,
    @Body() dto: CompleteOAuthProfileDto,
  ) {
    return this.usersService.completeOAuthProfile(request.user.userId, dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  redirectToGoogle() {}

  @Get('google/callback')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      const path = request.user.isNewUser ? '?onboarding=1' : '';
      res.redirect(safeRedirectUrl(path));
    } catch (err) {
      console.error('[OAuth Google] signIn failed:', err);
      res.redirect(safeRedirectUrl('?error=oauth_failed'));
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  redirectToGitHub() {}

  @Get('github/callback')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      const path = request.user.isNewUser ? '?onboarding=1' : '';
      res.redirect(safeRedirectUrl(path));
    } catch (err) {
      console.error('[OAuth GitHub] signIn failed:', err);
      res.redirect(safeRedirectUrl('?error=oauth_failed'));
    }
  }

  @Get('42')
  @UseGuards(AuthGuard('42'))
  redirectToFortyTwo() {}

  @Get('42/callback')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @UseGuards(AuthGuard('42'))
  async fortyTwoCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      const path = request.user.isNewUser ? '?onboarding=1' : '';
      res.redirect(safeRedirectUrl(path));
    } catch (err) {
      console.error('[OAuth 42] signIn failed:', err);
      res.redirect(safeRedirectUrl('?error=oauth_failed'));
    }
  }

  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @Patch('password')
  @UseGuards(PassportJwtAuthGuard)
  changePassword(
    @Request() request: RequestWithUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }
}
