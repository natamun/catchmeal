import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { ActivityService } from './activity.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@ApiTags('activity')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOkResponse({ description: 'Fil d’activité des amis' })
  @ApiForbiddenResponse({ description: 'Accès interdit' })
  @Get('activities')
  getFriendsFeed(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only view your own activity feed');
    }
    return this.activityService.getFriendsFeed(userId);
  }
}
