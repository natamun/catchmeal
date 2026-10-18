import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import 'multer';

import { ActivityService } from '../activity/activity.service';
import { CompleteOAuthProfileDto } from '../auth/dto/complete-oauth-profile.dto';
import { ActivityType, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

export const SAFE_USER_SELECT = {
  id: true,
  username: true,
  name: true,
} as const;

function crossedTarget(
  previous: number | undefined,
  current: number,
  target: number,
): boolean {
  if (previous === undefined) return false;
  return (
    (previous > target && current <= target) ||
    (previous < target && current >= target)
  );
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
    private readonly activityService: ActivityService,
  ) {}

  create(data: {
    username: string;
    name: string;
    email: string;
    passwordHash: string;
    oauthProvider?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  findById(id: number) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  findUserByName(username: string) {
    return this.prisma.user.findFirst({ where: { username, deletedAt: null } });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  updatePasswordHash(userId: number, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true },
    });
  }

  async deleteAvatar(userId: number) {
    await this.supabase.deleteAvatar(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { id: true, username: true, name: true, avatarUrl: true },
    });
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
        bodyFat: true,
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
      },
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { birthDate, ...rest } = dto;
    const previousGoal =
      dto.dailyCalorieGoal !== undefined
        ? (
            await this.prisma.user.findUnique({
              where: { id: userId },
              select: { dailyCalorieGoal: true },
            })
          )?.dailyCalorieGoal
        : undefined;

    try {
      const updated = await this.prisma.$transaction(async (tsc) => {
        const beforeUpdate = await tsc.user.findUnique({
          where: { id: userId },
          select: {
            dailyCalorieGoal: true,
            dailyProteinGoal: true,
            dailyCarbsGoal: true,
            dailyFatGoal: true,
          },
        });

        const user = await tsc.user.update({
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
            bodyFat: true,
            fatFreeMass: true,
            bodyWater: true,
            muscleMass: true,
          },
        });

        const currentGoalCalories = user.dailyCalorieGoal;

        if (
          currentGoalCalories !== null &&
          currentGoalCalories !== beforeUpdate?.dailyCalorieGoal
        ) {
          const latestWeightLog = await tsc.weightLog.findFirst({
            where: { userId },
            orderBy: { loggedAt: 'desc' },
            select: { weight: true },
          });
          const currentWeight = latestWeightLog?.weight;
          const targetWeight = user.targetWeight;

          let objective: string | null = null;
          if (
            currentWeight !== null &&
            currentWeight !== undefined &&
            targetWeight !== null &&
            targetWeight !== undefined
          ) {
            if (targetWeight < currentWeight) {
              objective = 'lose';
            } else if (targetWeight > currentWeight) {
              objective = 'gain';
            }
          }
          await tsc.goalSetting.create({
            data: {
              userId,
              startDate: new Date(),
              dailyCalories: currentGoalCalories,
              dailyProtein: user.dailyProteinGoal ?? null,
              dailyCarbs: user.dailyCarbsGoal ?? null,
              dailyFat: user.dailyFatGoal ?? null,
              objective: objective,
            },
          });
        }

        return user;
      });

      if (
        dto.dailyCalorieGoal !== undefined &&
        dto.dailyCalorieGoal !== previousGoal
      ) {
        await this.activityService.record(
          userId,
          ActivityType.CALORIE_GOAL_CHANGED,
          { goal: dto.dailyCalorieGoal },
        );
      }

      return updated;
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

  async updateWeight(
    userId: number,
    entryId: number,
    weight: number,
    bodyFat?: number,
    fatFreeMass?: number,
    bodyWater?: number,
    muscleMass?: number,
  ) {
    const entry = await this.prisma.weightLog.findUnique({
      where: { id: entryId },
    });
    if (!entry || entry.userId !== userId)
      throw new NotFoundException('Entry not found');
    return this.prisma.weightLog.update({
      where: { id: entryId },
      data: { weight, bodyFat, fatFreeMass, bodyWater, muscleMass },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
        loggedAt: true,
      },
    });
  }

  async logWeight(
    userId: number,
    weight: number,
    bodyFat?: number,
    fatFreeMass?: number,
    bodyWater?: number,
    muscleMass?: number,
  ) {
    const user = await this.prisma.user
      .findFirstOrThrow({ where: { id: userId } })
      .catch(() => {
        throw new NotFoundException('User not found');
      });
    const previous = await this.prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      select: { weight: true },
    });
    const entry = await this.prisma.weightLog.create({
      data: {
        userId,
        weight,
        bodyFat,
        fatFreeMass,
        bodyWater,
        muscleMass,
      },
      select: {
        id: true,
        weight: true,
        bodyFat: true,
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
        loggedAt: true,
      },
    });
    await this.activityService.record(userId, ActivityType.WEIGHT_LOGGED, {
      weight,
    });
    if (
      user.targetWeight !== null &&
      crossedTarget(previous?.weight, weight, user.targetWeight)
    ) {
      await this.activityService.record(
        userId,
        ActivityType.WEIGHT_GOAL_REACHED,
        { targetWeight: user.targetWeight },
      );
    }
    return entry;
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
        fatFreeMass: true,
        bodyWater: true,
        muscleMass: true,
        loggedAt: true,
      },
    });
  }

  search(query: string) {
    return this.prisma.user.findMany({
      where: {
        username: { contains: query, mode: 'insensitive' },
        deletedAt: null,
      },
      select: SAFE_USER_SELECT,
      take: 20,
      orderBy: { username: 'asc' },
    });
  }

  async completeOAuthProfile(userId: number, dto: CompleteOAuthProfileDto) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          username: dto.username.trim(),
          name: dto.name.trim(),
          email: dto.email.trim(),
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
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
          bodyFat: true,
          fatFreeMass: true,
          bodyWater: true,
          muscleMass: true,
        },
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
}
