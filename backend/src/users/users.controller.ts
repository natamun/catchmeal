import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import 'multer';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { LogWeightDto } from './dto/log-weight.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

interface RequestWithUser extends Express.Request {
  user: { userId: number; username: string };
}

@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateProfileDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('weight')
  logWeight(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: LogWeightDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only log your own weight');
    }
    return this.usersService.logWeight(
      userId,
      dto.weight,
      dto.bodyFat,
      dto.fatFreeMass,
      dto.bodyWater,
      dto.muscleMass,
    );
  }

  @Patch('weight/:entryId')
  updateWeight(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body() dto: LogWeightDto,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only update your own weight');
    }
    return this.usersService.updateWeight(
      userId,
      entryId,
      dto.weight,
      dto.bodyFat,
      dto.fatFreeMass,
      dto.bodyWater,
      dto.muscleMass,
    );
  }

  @Get('weight')
  getWeightHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only view your own weight history');
    }
    return this.usersService.getWeightHistory(userId);
  }

  @Delete('weight/:entryId')
  deleteWeight(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only delete your own weight');
    }
    return this.usersService.deleteWeight(userId, entryId);
  }

  @Delete('avatar')
  deleteAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only delete your own avatar');
    }
    return this.usersService.deleteAvatar(userId);
  }

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only update your own avatar');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    return this.usersService.updateAvatar(userId, file);
  }
}
