import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from './authenticated-socket';

@Injectable()
export class WsThrottlerGuard implements CanActivate {
  constructor(
    @InjectThrottlerStorage() private readonly storage: ThrottlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const handler = context.getHandler().name;
    const key = `ws:${handler}:${client.data.userId}`;

    const { totalHits } = await this.storage.increment(
      key,
      60_000,
      20,
      0,
      'ws',
    );
    if (totalHits > 20) {
      throw new WsException(
        'Trop de messages envoyés, réessayez dans un instant.',
      );
    }
    return true;
  }
}
