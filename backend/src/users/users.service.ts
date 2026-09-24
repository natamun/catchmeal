import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import 'multer';

import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export const SAFE_USER_SELECT = {
  id: true,
  username: true,
  name: true,
} as const;

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
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        height: true,
        targetWeight: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbsGoal: true,
        dailyFatGoal: true,
        gender: true,
        birthDate: true,
        activityLevel: true,
      },
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { birthDate, ...rest } = dto;
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...rest,
          ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        },
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          height: true,
          targetWeight: true,
          dailyCalorieGoal: true,
          dailyProteinGoal: true,
          dailyCarbsGoal: true,
          dailyFatGoal: true,
          gender: true,
          birthDate: true,
          activityLevel: true,
        },
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

  async updateWeight(userId: number, entryId: number, weight: number) {
    const entry = await this.prisma.weightLog.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.userId !== userId)
      throw new NotFoundException('Entry not found');
    return this.prisma.weightLog.update({
      where: { id: entryId },
      data: { weight },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        note: true,
        loggedAt: true,
      },
    });
  }

  async logWeight(
    userId: number,
    weight: number,
    bodyFat?: number,
    note?: string,
  ) {
    await this.prisma.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
    return this.prisma.weightLog.create({
      data: { userId, weight, bodyFat, note },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        note: true,
        loggedAt: true,
      },
    });
  }

  async getWeightHistory(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        note: true,
        loggedAt: true,
      },
    });
  }

  search(query: string) {
    return this.prisma.user.findMany({
      where: { username: { contains: query, mode: 'insensitive' }, deletedAt: null, },
      select: SAFE_USER_SELECT,
      take: 20,
      orderBy: { username: 'asc' },
    });
  }
}
