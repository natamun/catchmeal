import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../users/users.service';
import { AuthenticatedSocket } from './authenticated-socket';
import { WsAuthService } from './ws-auth.service';

describe('WsAuthService', () => {
  let service: WsAuthService;

  const jwtMock = { verify: jest.fn() };
  const usersMock = { findById: jest.fn() };

  const socketWith = (cookie?: string) =>
    ({
      handshake: { headers: cookie === undefined ? {} : { cookie } },
      data: {},
    }) as unknown as AuthenticatedSocket;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsAuthService,
        { provide: JwtService, useValue: jwtMock },
        { provide: UsersService, useValue: usersMock },
      ],
    }).compile();

    service = module.get<WsAuthService>(WsAuthService);
  });

  it('should reject a connection without any cookie', async () => {
    const next = jest.fn();
    await service.authenticate(socketWith(), next);
    expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    expect(jwtMock.verify).not.toHaveBeenCalled();
  });

  it('should reject a cookie that has no access_token', async () => {
    const next = jest.fn();
    await service.authenticate(socketWith('other=1'), next);
    expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    expect(jwtMock.verify).not.toHaveBeenCalled();
  });

  it('should reject an invalid or expired token', async () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const next = jest.fn();
    await service.authenticate(socketWith('access_token=bad'), next);
    expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    expect(usersMock.findById).not.toHaveBeenCalled();
  });

  it('should reject when the user no longer exists (e.g. soft-delete)', async () => {
    jwtMock.verify.mockReturnValue({ sub: 5 });
    usersMock.findById.mockResolvedValue(null);
    const socket = socketWith('access_token=abc');
    const next = jest.fn();
    await service.authenticate(socket, next);
    expect(next).toHaveBeenCalledWith(new Error('Unauthorized'));
    expect(socket.data.userId).toBeUndefined();
  });

  it('should accept a valid token and store the user id on the socket', async () => {
    jwtMock.verify.mockReturnValue({ sub: 5 });
    usersMock.findById.mockResolvedValue({ id: 5 });
    const socket = socketWith('access_token=abc');
    const next = jest.fn();
    await service.authenticate(socket, next);
    expect(jwtMock.verify).toHaveBeenCalledWith('abc');
    expect(socket.data.userId).toBe(5);
    expect(next).toHaveBeenCalledWith();
  });
});
