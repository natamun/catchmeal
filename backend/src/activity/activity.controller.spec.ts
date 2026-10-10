import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

describe('ActivityController', () => {
  let controller: ActivityController;

  const activityServiceMock = { getFriendsFeed: jest.fn() };
  const req = { user: { userId: 1 } } as never;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [{ provide: ActivityService, useValue: activityServiceMock }],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('should return the feed of the authenticated user', async () => {
    activityServiceMock.getFriendsFeed.mockResolvedValue([{ id: 1 }]);

    const result = await controller.getFriendsFeed(1, req);

    expect(activityServiceMock.getFriendsFeed).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should refuse to read another users feed', () => {
    expect(() => controller.getFriendsFeed(2, req)).toThrow(ForbiddenException);
    expect(activityServiceMock.getFriendsFeed).not.toHaveBeenCalled();
  });
});
