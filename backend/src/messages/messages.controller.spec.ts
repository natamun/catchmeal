import { Test, TestingModule } from '@nestjs/testing';

import { SendMessageDto } from './dto/send-message.dto';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;

  const messagesServiceMock = {
    send: jest.fn(),
    getConversation: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: messagesServiceMock }],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send a message', async () => {
    const dto: SendMessageDto = { toUserId: 2, content: 'hello' };
    const req = { user: { userId: 1, username: 'test' } } as never;
    await controller.send(1, dto, req);
    expect(messagesServiceMock.send).toHaveBeenCalledWith(
      1,
      2,
      'hello',
      undefined,
    );
  });

  it('should get a conversation', async () => {
    const req = { user: { userId: 1, username: 'test' } } as never;
    await controller.getConversation(1, 2, req);
    expect(messagesServiceMock.getConversation).toHaveBeenCalledWith(1, 2);
  });

  it('should forward the quoted activity id', async () => {
    const dto: SendMessageDto = {
      toUserId: 2,
      content: 'hello',
      activityId: 7,
    };
    const req = { user: { userId: 1, username: 'test' } } as never;
    await controller.send(1, dto, req);
    expect(messagesServiceMock.send).toHaveBeenCalledWith(1, 2, 'hello', 7);
  });
});
