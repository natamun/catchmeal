import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

type AuthInput = { username: string; password: string };
export type SignInData = {
  userId: number;
  username: string;
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
type AuthResult = {
  accessToken: string;
  userId: number;
  username: string;
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

interface OAuthUserParams {
  username: string;
  name: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findUserByName(input.username);

    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      return null;
    }

    return {
      userId: user.id,
      username: user.username,
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
    };
  }

  async findOrCreateFromOAuth(params: OAuthUserParams): Promise<SignInData> {
    const { username, name, email } = params;

    const existingUser = await this.usersService.findUserByName(username);

    if (existingUser) {
      return {
        userId: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
        avatarUrl: existingUser.avatarUrl,
        height: existingUser.height,
        targetWeight: existingUser.targetWeight,
        dailyCalorieGoal: existingUser.dailyCalorieGoal,
        dailyProteinGoal: existingUser.dailyProteinGoal,
        dailyCarbsGoal: existingUser.dailyCarbsGoal,
        dailyFatGoal: existingUser.dailyFatGoal,
        gender: existingUser.gender,
        birthDate: existingUser.birthDate,
        activityLevel: existingUser.activityLevel,
      };
    }

    const newUser = await this.usersService.create({
      username,
      name,
      email,
      passwordHash: '',
    });

    return { userId: newUser.id, username: newUser.username };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = await this.usersService.create({
        username: dto.username,
        name: dto.name,
        email: dto.email,
        passwordHash,
      });

      return this.signIn({ userId: user.id, username: user.username });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          "Ce nom d'utilisateur ou cet email est déjà pris",
        );
      }
      throw error;
    }
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const tokenPayload = {
      sub: user.userId,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
      username: user.username,
      userId: user.userId,
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
    };
  }
}
