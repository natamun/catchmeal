import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';

import { UsersService } from '../users/users.service';
import { AuthenticatedSocket } from './authenticated-socket';

@Injectable()
export class WsAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async authenticate(socket: AuthenticatedSocket, next: (err?: Error) => void) {
    try {
      const cookies = parse(socket.handshake.headers.cookie ?? '');
      const token = cookies.access_token;
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify<{ sub: number }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new Error('User not found');

      socket.data.userId = user.id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  }
}
