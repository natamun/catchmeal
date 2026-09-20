import { Controller, Get, Query } from '@nestjs/common';

import { SearchUsersDto } from './dto/search-users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersSearchController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  search(@Query() dto: SearchUsersDto) {
    return this.usersService.search(dto.search);
  }
}