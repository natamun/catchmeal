import { Test, TestingModule } from '@nestjs/testing';

import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

describe('FriendsController', () => {
  let controller: FriendsController;

  const friendsServiceMock = {
    sendRequest: jest.fn(),
    listFriends: jest.fn(),
    listPendingReceived: jest.fn(),
    acceptRequest: jest.fn(),
    removeOrDecline: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [{ provide: FriendsService, useValue: friendsServiceMock }],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send a friend request', async () => {
    const dto: CreateFriendRequestDto = { friendId: 2 };
    await controller.sendRequest(1, dto);
    expect(friendsServiceMock.sendRequest).toHaveBeenCalledWith(1, 2);
  });

  it('should list friends', async () => {
    await controller.listFriends(1);
    expect(friendsServiceMock.listFriends).toHaveBeenCalledWith(1);
  });

  it('should list pending requests', async () => {
    await controller.listPending(1);
    expect(friendsServiceMock.listPendingReceived).toHaveBeenCalledWith(1);
  });

  it('should accept a request', async () => {
    await controller.accept(1, 5);
    expect(friendsServiceMock.acceptRequest).toHaveBeenCalledWith(1, 5);
  });

  it('should remove or decline a friendship', async () => {
    await controller.remove(1, 5);
    expect(friendsServiceMock.removeOrDecline).toHaveBeenCalledWith(1, 5);
  });
});
