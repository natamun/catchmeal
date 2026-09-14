import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    username: string;
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({ data });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findUserByName(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }
}
