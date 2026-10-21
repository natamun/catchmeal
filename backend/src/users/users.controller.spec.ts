import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    deleteAvatar: jest.fn(),
    deleteWeight: jest.fn(),
    updateAvatar: jest.fn(),
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

  describe('deleteWeight', () => {
    it('should call deleteWeight service when user targets their own weight entry', async () => {
      usersServiceMock.deleteWeight.mockResolvedValue({ id: 5 });

      await controller.deleteWeight(
        1,
        5,
        mockReq(1) as Express.Request & {
          user: { userId: number; username: string };
        },
      );

      expect(usersServiceMock.deleteWeight).toHaveBeenCalledWith(1, 5);
    });

    it('should throw ForbiddenException when user targets someone else weight entry', () => {
      expect(() =>
        controller.deleteWeight(
          2,
          5,
          mockReq(1) as Express.Request & {
            user: { userId: number; username: string };
          },
        ),
      ).toThrow(ForbiddenException);

      expect(usersServiceMock.deleteWeight).not.toHaveBeenCalled();
    });
  });

  describe('uploadAvatar', () => {
    const validFile = {
      mimetype: 'image/jpeg',
      buffer: Buffer.from(''),
      originalname: 'avatar.jpg',
    } as Express.Multer.File;

    it('should call updateAvatar service with a valid file', async () => {
      usersServiceMock.updateAvatar.mockResolvedValue({ avatarUrl: 'url' });

      await controller.uploadAvatar(
        1,
        validFile,
        mockReq(1) as Express.Request & {
          user: { userId: number; username: string };
        },
      );

      expect(usersServiceMock.updateAvatar).toHaveBeenCalledWith(1, validFile);
    });

    it('should throw ForbiddenException when user targets someone else avatar', () => {
      expect(() =>
        controller.uploadAvatar(
          2,
          validFile,
          mockReq(1) as Express.Request & {
            user: { userId: number; username: string };
          },
        ),
      ).toThrow(ForbiddenException);

      expect(usersServiceMock.updateAvatar).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when no file is provided', () => {
      expect(() =>
        controller.uploadAvatar(
          1,
          undefined,
          mockReq(1) as Express.Request & {
            user: { userId: number; username: string };
          },
        ),
      ).toThrow(BadRequestException);

      expect(usersServiceMock.updateAvatar).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file type is not allowed', () => {
      const invalidFile = {
        ...validFile,
        mimetype: 'application/pdf',
      };

      expect(() =>
        controller.uploadAvatar(
          1,
          invalidFile,
          mockReq(1) as Express.Request & {
            user: { userId: number; username: string };
          },
        ),
      ).toThrow(BadRequestException);

      expect(usersServiceMock.updateAvatar).not.toHaveBeenCalled();
    });
  });
});
