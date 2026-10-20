import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { EmailTokenService } from '../email-token/email-token.service';
import { EmailService } from '../email/email.service';
import { EmailTokenType, Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findUserByName: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updatePasswordHash: jest.fn(),
    markEmailVerified: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const emailTokenServiceMock = {
    create: jest.fn(),
    consume: jest.fn(),
  };

  const emailServiceMock = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EmailTokenService, useValue: emailTokenServiceMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    process.env.FRONTEND_URL = 'http://localhost:5173';
    delete process.env.EMAIL_VERIFICATION_REQUIRED;
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

      expect(result).toEqual({
        userId: 1,
        username: 'alice',
        hasPassword: true,
      });
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
        hasPassword: true,
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

    it('should send a verification link built from the new token', async () => {
      usersServiceMock.create.mockResolvedValue({ id: 1, username: 'alice' });
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');
      emailTokenServiceMock.create.mockResolvedValue('tok123');

      await service.register(dto);

      expect(emailTokenServiceMock.create).toHaveBeenCalledWith(
        1,
        EmailTokenType.VERIFY_EMAIL,
      );
      expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
        'alice@example.com',
        'http://localhost:5173/verify-email?token=tok123',
      );
    });

    it('should not sign in and ask for verification when it is required', async () => {
      process.env.EMAIL_VERIFICATION_REQUIRED = 'true';
      usersServiceMock.create.mockResolvedValue({ id: 1, username: 'alice' });
      emailTokenServiceMock.create.mockResolvedValue('tok123');

      const result = await service.register(dto);

      expect(result).toEqual({ requiresVerification: true });
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
      expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should still register the user when the verification email cannot be prepared', async () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      usersServiceMock.create.mockResolvedValue({ id: 1, username: 'alice' });
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');
      emailTokenServiceMock.create.mockRejectedValue(new Error('db down'));

      const result = await service.register(dto);

      expect(result).toMatchObject({ accessToken: 'signed-token' });
      expect(emailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should not send any email when the account cannot be created', async () => {
      usersServiceMock.create.mockRejectedValue(new Error('database is down'));

      await expect(service.register(dto)).rejects.toThrow('database is down');

      expect(emailTokenServiceMock.create).not.toHaveBeenCalled();
      expect(emailServiceMock.sendVerificationEmail).not.toHaveBeenCalled();
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

  describe('changePassword', () => {
    const currentPassword = 'ancienmotdepasse';
    const newPassword = 'nouveaumotdepasse';

    it('should store a new hash and return success when the current password matches', async () => {
      const passwordHash = await bcrypt.hash(currentPassword, 10);
      usersServiceMock.findById.mockResolvedValue({ id: 1, passwordHash });
      usersServiceMock.updatePasswordHash.mockResolvedValue({ id: 1 });

      const result = await service.changePassword(
        1,
        currentPassword,
        newPassword,
      );

      expect(result).toEqual({ success: true });

      const calls = usersServiceMock.updatePasswordHash.mock.calls as [
        number,
        string,
      ][];
      const [userId, newHash] = calls[0];

      expect(userId).toBe(1);
      expect(newHash).not.toBe(newPassword);
      expect(await bcrypt.compare(newPassword, newHash)).toBe(true);
    });

    it('should throw a BadRequestException and keep the hash when the current password is wrong', async () => {
      const passwordHash = await bcrypt.hash(currentPassword, 10);
      usersServiceMock.findById.mockResolvedValue({ id: 1, passwordHash });

      await expect(
        service.changePassword(1, 'mauvaismotdepasse', newPassword),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(usersServiceMock.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('should throw a BadRequestException when the account has no password (OAuth)', async () => {
      usersServiceMock.findById.mockResolvedValue({ id: 1, passwordHash: '' });

      await expect(
        service.changePassword(1, currentPassword, newPassword),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(usersServiceMock.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('should throw a BadRequest when the new password is the same as the current one', async () => {
      const passwordHash = await bcrypt.hash(currentPassword, 10);
      usersServiceMock.findById.mockResolvedValue({ id: 1, passwordHash });

      await expect(
        service.changePassword(1, currentPassword, currentPassword),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(usersServiceMock.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('should throw an UnauthorizedException when the user does not exist', async () => {
      usersServiceMock.findById.mockResolvedValue(null);

      await expect(
        service.changePassword(1, currentPassword, newPassword),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(usersServiceMock.updatePasswordHash).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should mark the email as verified when the token is valid', async () => {
      emailTokenServiceMock.consume.mockResolvedValue({
        status: 'valid',
        userId: 1,
      });

      const result = await service.verifyEmail('tok123');

      expect(emailTokenServiceMock.consume).toHaveBeenCalledWith(
        'tok123',
        EmailTokenType.VERIFY_EMAIL,
      );
      expect(usersServiceMock.markEmailVerified).toHaveBeenCalledWith(1);
      expect(result).toEqual({ verified: true });
    });

    it('should answer verified when an already used link belongs to a verified account', async () => {
      emailTokenServiceMock.consume.mockResolvedValue({
        status: 'used',
        userId: 1,
      });
      usersServiceMock.findById.mockResolvedValue({
        id: 1,
        emailVerifiedAt: new Date(),
      });

      const result = await service.verifyEmail('tok123');

      expect(result).toEqual({ verified: true });
      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
    });

    it('should refuse a used link when the account is not verified', async () => {
      emailTokenServiceMock.consume.mockResolvedValue({
        status: 'used',
        userId: 1,
      });
      usersServiceMock.findById.mockResolvedValue({
        id: 1,
        emailVerifiedAt: null,
      });

      await expect(service.verifyEmail('tok123')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
    });

    it.each(['expired', 'invalid'])(
      'should refuse a %s link without verifying anything',
      async (status) => {
        emailTokenServiceMock.consume.mockResolvedValue({ status });

        await expect(service.verifyEmail('tok123')).rejects.toBeInstanceOf(
          BadRequestException,
        );
        expect(usersServiceMock.markEmailVerified).not.toHaveBeenCalled();
      },
    );
  });
});
