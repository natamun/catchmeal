import { ConflictException, Injectable } from '@nestjs/common';

import 'multer';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  create(data: {
    username: string;
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({ data });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findUserByName(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    const avatarUrl = await this.supabase.uploadAvatar(userId, file);
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, username: true, name: true, avatarUrl: true },
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: { id: true, username: true, name: true, avatarUrl: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException("Ce nom d'utilisateur est déjà pris");
      }
      throw error;
    }
  }
}
