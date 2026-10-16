import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  role?: string;
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
  bodyFat?: number | null;
  fatFreeMass?: number | null;
  bodyWater?: number | null;
  muscleMass?: number | null;
  hasPassword?: boolean;
  isNewUser?: boolean;
};

type AuthResult = {
  accessToken: string;
  userId: number;
  username: string;
  role?: string;
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
  hasPassword?: boolean;
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
      hasPassword: true,
    };
  }

  async findOrCreateFromOAuth(params: OAuthUserParams): Promise<SignInData> {
    const { username, name, email } = params;

    const existingUser = await this.usersService.findUserByEmail(email);

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
        bodyFat: existingUser.bodyFat,
        fatFreeMass: existingUser.fatFreeMass,
        bodyWater: existingUser.bodyWater,
        muscleMass: existingUser.muscleMass,
        isNewUser: false,
      };
    }

    try {
      const newUser = await this.usersService.create({
        username,
        name,
        email,
        passwordHash: '',
      });

      return {
        userId: newUser.id,
        username: newUser.username,
        isNewUser: true,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Race condition: user was created between our check and insert
        const retried = await this.usersService.findUserByEmail(email);
        if (retried)
          return {
            userId: retried.id,
            username: retried.username,
            isNewUser: false,
          };
      }
      throw error;
    }
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

      return this.signIn({
        userId: user.id,
        username: user.username,
        hasPassword: true,
      });
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
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
      username: user.username,
      userId: user.userId,
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
      hasPassword: user.hasPassword,
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        "Ce compte utilise une connexion Google/Github/42 : il n'y a pas de mot de passe à modifier",
      );
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        "Le nouveau mot de passe doit être différent de l'ancien",
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersService.updatePasswordHash(userId, passwordHash);

    return { success: true };
  }
}
