import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsService } from './friends.service';

@Controller('users/:userId')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('friends')
  sendRequest(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(userId, dto.friendId);
  }

  @Get('friends')
  listFriends(@Param('userId', ParseIntPipe) userId: number) {
    return this.friendsService.listFriends(userId);
  }

  @Get('friends/pending')
  listPending(@Param('userId', ParseIntPipe) userId: number) {
    return this.friendsService.listPendingReceived(userId);
  }

  @Get('friends/sent')
  listSent(@Param('userId', ParseIntPipe) userId: number) {
    return this.friendsService.listPendingSent(userId);
  }

  @Patch('friends/:id/accept')
  accept(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.friendsService.acceptRequest(userId, id);
  }

  @Delete('friends/:id')
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.friendsService.removeOrDecline(userId, id);
  }
}
