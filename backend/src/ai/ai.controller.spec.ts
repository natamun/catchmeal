import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

describe('AiController', () => {
  let controller: AiController;

  const aiServiceMock = {
    chat: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: aiServiceMock }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call aiService.chat with userId', async () => {
    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    await controller.chat(42, dto);

    expect(aiServiceMock.chat).toHaveBeenCalledWith(42, 'Hello from Italy');
  });

  it('should work (first message)', async () => {
    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    await controller.chat(42, dto);

    expect(aiServiceMock.chat).toHaveBeenCalledWith(42, 'Hello from Italy');
  });

  it('should return an object containing the message', async () => {
    aiServiceMock.chat.mockResolvedValue({
      message: 'Hello from Italy',
    });

    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    const chat = await controller.chat(42, dto);

    expect(chat).toEqual({
      message: 'Hello from Italy',
    });
  });

  it('should return an object containing the message', async () => {
    aiServiceMock.chat.mockResolvedValue({
      message: 'Hello from Italy',
    });

    const dto: ChatDto = {
      message: 'Hello from Italy',
    };
    const chat = await controller.chat(42, dto);

    expect(chat).toEqual({
      message: 'Hello from Italy',
    });
  });
});
