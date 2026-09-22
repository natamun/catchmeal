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

type RequestWithUser = ExpressRequest & {
  user: SignInData & {
    name?: string;
    avatarUrl?: string | null;
    height?: number | null;
    targetWeight?: number | null;
    dailyCalorieGoal?: number | null;
    dailyProteinGoal?: number | null;
    dailyCarbsGoal?: number | null;
    dailyFatGoal?: number | null;
    gender?: string | null;
    birthDate?: Date | null;
    activityLevel?: string | null;
  };
};

const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // same as expiresIn from JwtModule

@Controller('auth')
export class PassportAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      accessToken,
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    } = await this.authService.register(dto);
    this.setAuthCookie(res, accessToken);
    return {
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(
    @Request() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      accessToken,
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    } = await this.authService.signIn(request.user);
    this.setAuthCookie(res, accessToken);
    return {
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    };
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
    const {
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    } = request.user;
    return {
      userId,
      username,
      name,
      avatarUrl,
      height,
      targetWeight,
      dailyCalorieGoal,
      dailyProteinGoal,
      dailyCarbsGoal,
      dailyFatGoal,
      gender,
      birthDate,
      activityLevel,
    };
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
    @Res() res: Response,
  ) {
    const { accessToken } = await this.authService.signIn(request.user);
    this.setAuthCookie(res as any, accessToken);
    // Redirect to frontend after successful OAuth login
    (res as any).redirect(process.env.FRONTEND_URL ?? 'http://localhost:5173');
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
