import {
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
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsService } from './friends.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @Post('friends')
  sendRequest(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFriendRequestDto,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.sendRequest(userId, dto.friendId);
  }

  @Get('friends')
  listFriends(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listFriends(userId);
  }

  @Get('friends/activity')
  getFriendsActivity(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.getFriendsActivity(userId);
  }

  @Get('friends/pending')
  listPending(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listPendingReceived(userId);
  }

  @Get('friends/sent')
  listSent(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listPendingSent(userId);
  }

  @Patch('friends/:id/accept')
  accept(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.acceptRequest(userId, id);
  }

  @Delete('friends/:id')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.removeOrDecline(userId, id);
  }
}
