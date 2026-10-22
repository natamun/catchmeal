import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const usersServiceMock = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should return the user info when the user still exists', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: 1,
      username: 'alice',
      passwordHash: 'hash',
    });

    const result = await strategy.validate({ sub: 1, username: 'alice' });

    expect(result).toEqual({
      userId: 1,
      username: 'alice',
      hasPassword: true,
      emailVerified: false,
    });
  });

  it('should report that an OAuth account has no password', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: 2,
      username: 'bob',
      passwordHash: '',
    });

    const result = await strategy.validate({ sub: 2, username: 'bob' });

    expect(result).toMatchObject({ userId: 2, hasPassword: false });
  });

  it('should reject the token when the user no longer exists', async () => {
    usersServiceMock.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 1, username: 'alice' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should report whether the email is verified', async () => {
    usersServiceMock.findById.mockResolvedValue({
      id: 3,
      username: 'carol',
      passwordHash: 'hash',
      emailVerifiedAt: new Date(),
    });

    const result = await strategy.validate({ sub: 3, username: 'carol' });

    expect(result).toMatchObject({ userId: 3, emailVerified: true });
  });
});
