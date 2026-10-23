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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsService } from './friends.service';

interface RequestWithUser extends Express.Request {
  user: { userId: number };
}

@ApiTags('friends')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@ApiForbiddenResponse({ description: 'Accès interdit' })
@Controller('users/:userId')
@UseGuards(PassportJwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  private checkOwnership(paramUserId: number, jwtUserId: number) {
    if (paramUserId !== jwtUserId) throw new ForbiddenException();
  }

  @ApiCreatedResponse({ description: 'Demande envoyée' })
  @ApiBadRequestResponse({ description: "Impossible de s'ajouter soi-même" })
  @ApiConflictResponse({ description: 'Demande déjà existante' })
  @Post('friends')
  sendRequest(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateFriendRequestDto,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.sendRequest(userId, dto.friendId);
  }

  @ApiOkResponse({ description: 'Liste des amis' })
  @Get('friends')
  listFriends(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listFriends(userId);
  }

  @ApiOkResponse({ description: 'Demandes reçues en attente' })
  @Get('friends/pending')
  listPending(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listPendingReceived(userId);
  }

  @ApiOkResponse({ description: 'Demandes envoyées en attente' })
  @Get('friends/sent')
  listSent(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.listPendingSent(userId);
  }

  @ApiOkResponse({ description: 'Demande acceptée' })
  @ApiNotFoundResponse({ description: 'Demande introuvable' })
  @Patch('friends/:id/accept')
  accept(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    this.checkOwnership(userId, req.user.userId);
    return this.friendsService.acceptRequest(userId, id);
  }

  @ApiOkResponse({ description: 'Ami supprimé ou demande refusée' })
  @ApiNotFoundResponse({ description: 'Relation introuvable' })
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
