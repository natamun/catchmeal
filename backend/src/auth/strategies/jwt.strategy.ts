import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';

import { UsersService } from '../../users/users.service';

function extractJwtFromCookie(req: Request): string | null {
  return (req?.cookies?.access_token as string | undefined) ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: { sub: number; username: string; role?: string }) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      avatarUrl: user.avatarUrl,
      height: user.height,
      targetWeight: user.targetWeight,
      dailyCalorieGoal: user.dailyCalorieGoal,
      dailyProteinGoal: user.dailyProteinGoal,
      dailyCarbsGoal: user.dailyCarbsGoal,
      dailyFatGoal: user.dailyFatGoal,
      gender: user.gender,
      birthDate: user.birthDate,
      activityLevel: user.activityLevel,
      bodyFat: user.bodyFat,
      fatFreeMass: user.fatFreeMass,
      bodyWater: user.bodyWater,
      muscleMass: user.muscleMass,
      hasPassword: Boolean(user.passwordHash),
    };
  }
}
