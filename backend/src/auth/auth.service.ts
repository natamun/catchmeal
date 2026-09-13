import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

type AuthInput = { username: string; password: string };
export type SignInData = { userId: number; username: string };
type AuthResult = { accessToken: string; userId: number; username: string };

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
    };
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

    return { accessToken, username: user.username, userId: user.userId };
  }
}
