import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest, Response } from 'express';

import { AuthService, type SignInData } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { PassportJwtAuthGuard } from './guards/passport-jwt.guard';
import { PassportLocalGuard } from './guards/passport-local.guard';

type RequestWithUser = ExpressRequest & { user: SignInData };

type UserResponse = Omit<SignInData, 'userId'> & { userId: number };

function toUserResponse(data: SignInData): UserResponse {
  return {
    userId: data.userId,
    username: data.username,
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
  };
}

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // same as expiresIn from JwtModule

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

@Controller('auth')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookie(res, result.accessToken);
    return toUserResponse(result);
  }

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
  @UseGuards(PassportJwtAuthGuard)
  getUserInfo(@Request() request: RequestWithUser) {
    return toUserResponse(request.user);
  }

  // OAuth Google — Step 1: redirect to Google login page
  @Get('google')
  @UseGuards(AuthGuard('google'))
  redirectToGoogle() {
    // Passport handles the redirect automatically
  }

  // OAuth Google — Step 2: Google redirects back here after user grants permission
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      res.redirect(FRONTEND_URL);
    } catch (err) {
      console.error('[OAuth Google] signIn failed:', err);
      res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
    }
  }

  // OAuth GitHub — Step 1: redirect to GitHub login page
  @Get('github')
  @UseGuards(AuthGuard('github'))
  redirectToGitHub() {
    // Passport handles the redirect automatically
  }

  // OAuth GitHub — Step 2: GitHub redirects back here after user grants permission
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      res.redirect(FRONTEND_URL);
    } catch (err) {
      console.error('[OAuth GitHub] signIn failed:', err);
      res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
    }
  }

  // OAuth 42 — Step 1: redirect to 42 login page
  @Get('42')
  @UseGuards(AuthGuard('42'))
  redirectToFortyTwo() {
    // Passport handles the redirect automatically
  }

  // OAuth 42 — Step 2: 42 redirects back here after user grants permission
  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoCallback(
    @Request() request: RequestWithUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    try {
      const { accessToken } = await this.authService.signIn(request.user);
      this.setAuthCookie(res, accessToken);
      res.redirect(FRONTEND_URL);
    } catch (err) {
      console.error('[OAuth 42] signIn failed:', err);
      res.redirect(`${FRONTEND_URL}?error=oauth_failed`);
    }
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
