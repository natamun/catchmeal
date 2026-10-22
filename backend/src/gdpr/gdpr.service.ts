import { Injectable, NotFoundException } from '@nestjs/common';

import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class GdprService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly supabase: SupabaseService,
  ) {}

  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: {
        passwordHash: true,
        id: true,
        role: true,
        deletedAt: true,
      },
      include: {
        meal: { include: { items: true } },
        foodItems: true,
        weightLogs: true,
        goalSettings: true,
        senderMessage: true,
        receiverMessage: true,
        activities: true,
        userFriend: {
          include: { friendUser: { select: { username: true, name: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // A failed confirmation email must not lose the already-computed export
    try {
      await this.emailService.sendDataExportConfirmation(user.email);
    } catch (error) {
      console.error('[GDPR] Failed to send data export email:', error);
    }

    return {
      exportedAt: new Date().toISOString(),
      data: { profile: user },
    };
  }

  /**
   * Soft-deletes an account: erases all personal data that hangs off the user
   * (weigh-ins, goals, meals and their food lines, food items, activities and
   * pending/declined friend requests), keeps accepted friendships and messages
   * (shown as a "deleted user"), clears the profile, anonymises the identity
   * and sets deletedAt. The user row itself is kept so relations don't break.
   *
   * @param sendEmail whether to send the confirmation email (self-deletion),
   *                  skipped for admin-initiated deletions.
   */
  async deleteAccount(userId: number, sendEmail = true) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Save email before anonymizing — needed for the confirmation email
    const userEmail = user.email;

    await this.prisma.$transaction(async (tx) => {
      // Meal food lines before meals and food items (no cascade to FoodItem)
      await tx.mealFoodItem.deleteMany({ where: { userId } });
      await tx.meal.deleteMany({ where: { userId } });
      await tx.foodItem.deleteMany({ where: { userId } });

      await tx.weightLog.deleteMany({ where: { userId } });
      await tx.goalSetting.deleteMany({ where: { userId } });
      await tx.emailToken.deleteMany({ where: { userId } });

      // Kept messages may quote the user's activities; detach them first,
      // otherwise deleting the activities would violate the FK.
      await tx.message.updateMany({
        where: { activity: { userId } },
        data: { activityId: null },
      });
      await tx.activity.deleteMany({ where: { userId } });

      // Drop pending/declined friend requests, keep accepted friendships
      await tx.friend.deleteMany({
        where: {
          status: { not: 'ACCEPTED' },
          OR: [{ userId }, { friendId: userId }],
        },
      });

      // Clear the profile + anonymise identity + mark as deleted
      await tx.user.update({
        where: { id: userId },
        data: {
          username: `deleted_user_${userId}`,
          name: 'Deleted User',
          email: `deleted_${userId}@deleted.invalid`,
          passwordHash: '',
          oauthProvider: null,
          avatarUrl: null,
          height: null,
          targetWeight: null,
          dailyCalorieGoal: null,
          dailyProteinGoal: null,
          dailyCarbsGoal: null,
          dailyFatGoal: null,
          gender: null,
          birthDate: null,
          activityLevel: null,
          lastSeenAt: null,
          deletedAt: new Date(),
        },
      });
    });

    // Avatar file lives in Supabase storage, outside the DB transaction
    if (user.avatarUrl) {
      await this.supabase.deleteAvatar(userId);
    }

    // The deletion already happened; a failed email must not surface as an
    // error, otherwise the client thinks the irreversible action failed.
    if (sendEmail) {
      try {
        await this.emailService.sendAccountDeletionConfirmation(userEmail);
      } catch (error) {
        console.error('[GDPR] Failed to send account deletion email:', error);
      }
    }

    return { message: 'Account successfully deleted' };
  }
}
