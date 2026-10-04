import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { SearchUsersDto } from './dto/search-users.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(PassportJwtAuthGuard)
export class UsersSearchController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  search(@Query() dto: SearchUsersDto) {
    return this.usersService.search(dto.search);
  }
}
