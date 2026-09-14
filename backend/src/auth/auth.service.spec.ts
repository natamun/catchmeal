import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findUserByName: jest.fn(),
    create: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null when the user does not exist', async () => {
      usersServiceMock.findUserByName.mockResolvedValue(null);

      const result = await service.validateUser({
        username: 'alice',
        password: 'motdepasse123',
      });

      expect(result).toBeNull();
    });

    it('should return null when the password does not match', async () => {
      const passwordHash = await bcrypt.hash('rightpassword', 10);
      usersServiceMock.findUserByName.mockResolvedValue({
        id: 1,
        username: 'alice',
        passwordHash,
      });

      const result = await service.validateUser({
        username: 'alice',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should return the user id and username when the password matches', async () => {
      const passwordHash = await bcrypt.hash('motdepasse123', 10);
      usersServiceMock.findUserByName.mockResolvedValue({
        id: 1,
        username: 'alice',
        passwordHash,
      });

      const result = await service.validateUser({
        username: 'alice',
        password: 'motdepasse123',
      });

      expect(result).toEqual({ userId: 1, username: 'alice' });
    });
  });

  describe('register', () => {
    const dto: RegisterDto = {
      username: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      password: 'motdepasse123',
    };

    it('should hash the password before storing the user', async () => {
      usersServiceMock.create.mockResolvedValue({ id: 1, username: 'alice' });
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');

      await service.register(dto);

      const calls = usersServiceMock.create.mock.calls as {
        passwordHash: string;
      }[][];
      const createCall = calls[0][0];

      expect(createCall.passwordHash).not.toBe(dto.password);
      expect(await bcrypt.compare(dto.password, createCall.passwordHash)).toBe(
        true,
      );
    });

    it('should sign in the newly created user and return a token', async () => {
      usersServiceMock.create.mockResolvedValue({ id: 1, username: 'alice' });
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');

      const result = await service.register(dto);

      expect(result).toEqual({
        accessToken: 'signed-token',
        userId: 1,
        username: 'alice',
      });
    });

    it('should throw a ConflictException when the username or email is already taken', async () => {
      usersServiceMock.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.9.1',
        }),
      );

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('should rethrow errors that are not a duplicate constraint violation', async () => {
      const unexpectedError = new Error('database is down');
      usersServiceMock.create.mockRejectedValue(unexpectedError);

      await expect(service.register(dto)).rejects.toBe(unexpectedError);
    });
  });

  describe('signIn', () => {
    it('should sign a token payload with the user id and username', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');

      const result = await service.signIn({ userId: 1, username: 'alice' });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        username: 'alice',
      });
      expect(result).toEqual({
        accessToken: 'signed-token',
        userId: 1,
        username: 'alice',
      });
    });
  });
});
