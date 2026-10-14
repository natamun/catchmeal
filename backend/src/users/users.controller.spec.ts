import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    deleteAvatar: jest.fn(),
  };

  const mockReq = (
    userId: number,
  ): { user: { userId: number; username: string } } => ({
    user: { userId, username: 'alice' },
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('deleteAvatar', () => {
    it('should call deleteAvatar service when user targets their own avatar', async () => {
      usersServiceMock.deleteAvatar.mockResolvedValue({
        id: 1,
        avatarUrl: null,
      });

      await controller.deleteAvatar(
        1,
        mockReq(1) as Express.Request & {
          user: { userId: number; username: string };
        },
      );

      expect(usersServiceMock.deleteAvatar).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException when user targets someone else avatar', () => {
      expect(() =>
        controller.deleteAvatar(
          2,
          mockReq(1) as Express.Request & {
            user: { userId: number; username: string };
          },
        ),
      ).toThrow(ForbiddenException);

      expect(usersServiceMock.deleteAvatar).not.toHaveBeenCalled();
    });
  });
});
