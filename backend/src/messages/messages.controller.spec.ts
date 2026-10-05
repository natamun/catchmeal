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
    await controller.send(1, dto);
    expect(messagesServiceMock.send).toHaveBeenCalledWith(1, 2, 'hello');
  });

  it('should get a conversation', async () => {
    await controller.getConversation(1, 2);
    expect(messagesServiceMock.getConversation).toHaveBeenCalledWith(1, 2);
  });
});
