import { Test, TestingModule } from '@nestjs/testing';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

describe('AiController', () => {
  let controller: AiController;

  const aiServiceMock = {
    chat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: aiServiceMock }],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call aiService.chat with userId, message and conversationId', async () => {
    const dto: ChatDto = {
      message: 'Hello from Italy',
      conversationId: 'conv_1',
    };
    await controller.chat(42, dto);

    expect(aiServiceMock.chat).toHaveBeenCalledWith(
      42,
      'Hello from Italy',
      'conv_1',
    );
  });

  it('should work without a conversationId (first message)', async () => {
    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    await controller.chat(42, dto);

    expect(aiServiceMock.chat).toHaveBeenCalledWith(
      42,
      'Hello from Italy',
      undefined,
    );
  });

  it('should return an object containing the message without a conversationId', async () => {
    aiServiceMock.chat.mockResolvedValue({
      message: 'Hello from Italy',
    });

    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    const chat = await controller.chat(42, dto);

    expect(chat).toEqual({
      message: 'Hello from Italy',
      convertationId: undefined,
    });
  });

  it('should return an object containing the message and conversationId', async () => {
    aiServiceMock.chat.mockResolvedValue({
      message: 'Hello from Italy',
      conversationId: 'conv_11223424323',
    });

    const dto: ChatDto = {
      message: 'Hello from Italy',
      conversationId: 'conv_11223424323',
    };
    const chat = await controller.chat(42, dto);

    expect(chat).toEqual({
      message: 'Hello from Italy',
      conversationId: 'conv_11223424323',
    });
  });
});
