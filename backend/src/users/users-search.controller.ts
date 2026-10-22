import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { SearchUsersDto } from './dto/search-users.dto';
import { UsersService } from './users.service';

@ApiTags('users-search')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@Controller('users')
@UseGuards(PassportJwtAuthGuard)
export class UsersSearchController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ description: 'Résultats de recherche' })
  @Get()
  search(@Query() dto: SearchUsersDto) {
    return this.usersService.search(dto.search);
  }
}
