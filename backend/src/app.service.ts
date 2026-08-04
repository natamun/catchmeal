import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello From BackEnd!';
  }

  async getUsers() {
    await this.prisma.user.upsert({
      where: { username: 'kcal' },
      update: {},
      create: { username: 'kcal', name: 'todefine' },
    });
    return this.prisma.user.findMany();
  }
}
