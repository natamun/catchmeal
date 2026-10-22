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
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('admin')
@ApiCookieAuth('jwt')
@ApiUnauthorizedResponse({ description: 'Non authentifié' })
@ApiForbiddenResponse({ description: 'Rôle ADMIN requis' })
@Controller('admin')
@UseGuards(PassportJwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOkResponse({ description: 'Liste des utilisateurs' })
  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @ApiOkResponse({ description: 'Détail utilisateur' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @ApiOkResponse({ description: 'Statistiques générales' })
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @ApiOkResponse({ description: 'Utilisateur supprimé' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @ApiOkResponse({ description: 'Utilisateur mis à jour' })
  @ApiNotFoundResponse({ description: 'Utilisateur introuvable' })
  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }
}
