import { Test, TestingModule } from '@nestjs/testing';

import { MealsService } from '../meals/meals.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  const mealsServiceMock = {
    findRange: jest.fn(),
  };

  const mistralMock = {
    beta: {
      conversations: {
        start: jest.fn(),
        append: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: MealsService, useValue: mealsServiceMock },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    (service as unknown as { mistral: typeof mistralMock }).mistral =
      mistralMock;
  });

  it('should return the text directly when Mistral does not call a function', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      conversationId: 'conv_1',
      outputs: [{ type: 'message.output', content: 'Bonjour !' }],
    });

    const result = await service.chat(42, 'Salut');

    expect(result.message).toBe('Bonjour !');
    expect(result.conversationId).toBe('conv_1');
    expect(mealsServiceMock.findRange).not.toHaveBeenCalled();
  });

  it('should call findRange with the correct userId and dates when get_meals is requested', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      conversationId: 'conv_2',
      outputs: [
        {
          type: 'function.call',
          name: 'get_meals',
          toolCallId: 'call_1',
          arguments: JSON.stringify({ period: 'week' }),
        },
      ],
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      conversationId: 'conv_2',
      outputs: [{ type: 'message.output', content: 'Voici tes repas.' }],
    });
    mealsServiceMock.findRange.mockResolvedValue([{ id: 1, name: 'Pizza' }]);

    const result = await service.chat(42, 'Montre-moi mes repas');

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(
      42,
      expect.any(Date),
      expect.any(Date),
    );
    expect(result.message).toBe('Voici tes repas.');
  });

  it('should return a generic error result to Mistral when the function name is unknown', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      conversationId: 'conv_3',
      outputs: [
        {
          type: 'function.call',
          name: 'unknown_tool',
          toolCallId: 'call_2',
          arguments: '{}',
        },
      ],
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      conversationId: 'conv_3',
      outputs: [
        { type: 'message.output', content: "Je ne peux pas faire ça." },
      ],
    });

    const result = await service.chat(42, 'Fais un truc bizarre');

    expect(mistralMock.beta.conversations.append).toHaveBeenCalledWith({
      conversationId: 'conv_3',
      conversationAppendRequest: {
        inputs: [
          {
            toolCallId: 'call_2',
            result: JSON.stringify({
              success: false,
              error: 'Invalid function call.',
            }),
          },
        ],
      },
    });
    expect(result.message).toBe('Je ne peux pas faire ça.');
  });

  it('should return a generic error message when the database call fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mistralMock.beta.conversations.start.mockResolvedValue({
      conversationId: 'conv_4',
      outputs: [
        {
          type: 'function.call',
          name: 'get_meals',
          toolCallId: 'call_3',
          arguments: JSON.stringify({ period: 'day' }),
        },
      ],
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      conversationId: 'conv_4',
      outputs: [
        {
          type: 'message.output',
          content: "Je n'ai pas pu récupérer tes repas.",
        },
      ],
    });
    mealsServiceMock.findRange.mockRejectedValue(new Error('DB down'));

    const result = await service.chat(42, "Qu'est-ce que j'ai mangé ?");

    expect(mistralMock.beta.conversations.append).toHaveBeenCalledWith({
      conversationId: 'conv_4',
      conversationAppendRequest: {
        inputs: [
          {
            toolCallId: 'call_3',
            result: JSON.stringify({
              success: false,
              error: 'Failed to retrieve meals from database.',
            }),
          },
        ],
      },
    });
    expect(result.message).toBe("Je n'ai pas pu récupérer tes repas.");

    consoleErrorSpy.mockRestore();
  });
});
