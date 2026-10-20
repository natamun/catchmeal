import { ExecutionContext } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from './authenticated-socket';
import { WsThrottlerGuard } from './ws-throttler.guard';

describe('WsThrottlerGuard', () => {
  let guard: WsThrottlerGuard;
  let hits: Record<string, number>;
  const storageMock: Partial<ThrottlerStorage> = {
    increment: jest.fn((key: string) => {
      hits[key] = (hits[key] ?? 0) + 1;
      return Promise.resolve({
        totalHits: hits[key],
        timeToExpire: 60,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    }),
  };

  const contextFor = (userId: number, handlerName = 'handleSend') =>
    ({
      switchToWs: () => ({
        getClient: () =>
          ({ data: { userId } }) as unknown as AuthenticatedSocket,
      }),
      getHandler: () => ({ name: handlerName }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    hits = {};
    jest.clearAllMocks();
    guard = new WsThrottlerGuard(storageMock as ThrottlerStorage);
  });

  it('autorise jusqu’à 20 appels pour le même utilisateur', async () => {
    for (let i = 0; i < 20; i++) {
      await expect(guard.canActivate(contextFor(42))).resolves.toBe(true);
    }
  });

  it('bloque le 21e appel pour le même utilisateur', async () => {
    for (let i = 0; i < 20; i++) {
      await guard.canActivate(contextFor(42));
    }
    await expect(guard.canActivate(contextFor(42))).rejects.toThrow(
      WsException,
    );
  });

  it('ne partage pas le compteur entre deux utilisateurs différents', async () => {
    for (let i = 0; i < 20; i++) {
      await guard.canActivate(contextFor(1));
    }
    await expect(guard.canActivate(contextFor(2))).resolves.toBe(true);
  });
});
