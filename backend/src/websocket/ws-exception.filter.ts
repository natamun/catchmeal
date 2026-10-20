import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import type { AuthenticatedSocket } from './authenticated-socket';

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const error = exception.getError();
    const message =
      typeof error === 'string'
        ? error
        : ((error as { message?: string })?.message ?? 'Erreur');

    const ack = host.getArgByIndex<unknown>(2);
    if (typeof ack === 'function') {
      (ack as (response: { error: string }) => void)({ error: message });
      return;
    }

    const client = host.switchToWs().getClient<AuthenticatedSocket>();
    client.emit('exception', { message });
  }
}
