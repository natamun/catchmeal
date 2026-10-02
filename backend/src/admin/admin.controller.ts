import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(PassportJwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // GET /admin/users — list all users
  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  // GET /admin/users/:id — get user detail
  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  // GET /admin/stats — general statistics
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // DELETE /admin/users/:id — soft delete a user
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // PATCH /admin/users/:id/role — update user role
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: 'USER' | 'ADMIN' },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }
}
