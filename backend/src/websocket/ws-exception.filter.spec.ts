import { ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { WsExceptionFilter } from './ws-exception.filter';

describe('WsExceptionFilter', () => {
  const hostFor = (ack: unknown, client: { emit: jest.Mock }) =>
    ({
      getArgByIndex: () => ack,
      switchToWs: () => ({ getClient: () => client }),
    }) as unknown as ArgumentsHost;

  it('renvoie l’erreur via le callback d’acquittement quand il est fourni', () => {
    const filter = new WsExceptionFilter();
    const ack = jest.fn();
    const client = { emit: jest.fn() };

    filter.catch(
      new WsException('Trop de messages envoyés.'),
      hostFor(ack, client),
    );

    expect(ack).toHaveBeenCalledWith({ error: 'Trop de messages envoyés.' });
    expect(client.emit).not.toHaveBeenCalled();
  });

  it("retombe sur l'événement 'exception' quand il n'y a pas d'acquittement", () => {
    const filter = new WsExceptionFilter();
    const client = { emit: jest.fn() };

    filter.catch(new WsException('Erreur'), hostFor(undefined, client));

    expect(client.emit).toHaveBeenCalledWith('exception', {
      message: 'Erreur',
    });
  });
});
