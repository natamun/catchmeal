import { ForbiddenException, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

import type { AuthenticatedSocket } from '../websocket/authenticated-socket';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

describe('MessagesGateway', () => {
  const messagesServiceMock = { send: jest.fn() };
  const client = { data: { userId: 1 } } as AuthenticatedSocket;
  const payload = { toUserId: 2, content: 'Salut' };
  let gateway: MessagesGateway;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    messagesServiceMock.send.mockReset();
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    gateway = new MessagesGateway(
      messagesServiceMock as unknown as MessagesService,
    );
    const room = { to: jest.fn(), emit: jest.fn() };
    room.to.mockReturnValue(room);
    gateway.server = room as unknown as Server;
  });

  afterEach(() => {
    logError.mockRestore();
  });

  it('should refuse an invalid payload', async () => {
    await expect(
      gateway.handleSend(client, { toUserId: 2, content: '' }),
    ).resolves.toEqual({ error: 'Message invalide.' });
    expect(messagesServiceMock.send).not.toHaveBeenCalled();
  });

  it('should pass on the message of an expected refusal', async () => {
    messagesServiceMock.send.mockRejectedValue(
      new ForbiddenException('Vous devez être amis pour échanger des messages'),
    );

    await expect(gateway.handleSend(client, payload)).resolves.toEqual({
      error: 'Vous devez être amis pour échanger des messages',
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it('should hide the details of an unexpected error', async () => {
    messagesServiceMock.send.mockRejectedValue(
      new Error('Invalid `prisma.message.create()` invocation'),
    );

    await expect(gateway.handleSend(client, payload)).resolves.toEqual({
      error: 'Message non envoyé, réessayez.',
    });
    expect(logError).toHaveBeenCalled();
  });
});
