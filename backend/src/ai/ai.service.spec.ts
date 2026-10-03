import { Test, TestingModule } from '@nestjs/testing';

import { AiContextService } from '../ai-context/ai-context.service';
import { DashboardAnalyticsService } from '../dashboard-analytics/dashboard-analytics.service';
import { MealsService } from '../meals/meals.service';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  const mealsServiceMock = {
    findRange: jest.fn(),
  };

  const dashboardAnalyticsServiceMock = {
    getDashboard: jest.fn(),
  };

  const aiContextServiceMock = {
    getProfile: jest.fn(),
    getWeightHistory: jest.fn(),
    getMeals: jest.fn(),
    getGoalSettings: jest.fn(),
    getFrequentFoodItems: jest.fn(),
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
        {
          provide: DashboardAnalyticsService,
          useValue: dashboardAnalyticsServiceMock,
        },
        { provide: AiContextService, useValue: aiContextServiceMock },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    (service as unknown as { mistral: typeof mistralMock }).mistral =
      mistralMock;
  });

  it('should return the text directly when Mistral does not call a function', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      outputs: [{ type: 'message.output', content: 'Bonjour !' }],
    });

    const result = await service.chat(42, 'Salut');

    expect(result.message).toBe('Bonjour !');
    expect(mealsServiceMock.findRange).not.toHaveBeenCalled();
  });

  it('should call findRange with the correct userId and dates when get_meals is requested', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      outputs: [
        {
          type: 'function.call',
          name: 'get_meals',
          toolCallId: 'call_3',
          arguments: JSON.stringify({
            period: { from: '2026-09-21', to: '2026-09-28' },
          }),
        },
      ],
      conversationId: 'conv_442',
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      outputs: [
        {
          type: 'message.output',
          content: 'Voici tes repas.',
        },
      ],
      conversationId: 'conv_442',
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
      outputs: [
        { type: 'message.output', content: 'Je ne peux pas faire ça.' },
      ],
    });

    const result = await service.chat(42, 'Fais un truc bizarre');

    expect(mistralMock.beta.conversations.append).toHaveBeenCalledWith({
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
      outputs: [
        {
          type: 'function.call',
          name: 'get_meals',
          toolCallId: 'call_3',
        },
      ],
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      outputs: [
        {
          type: 'message.output',
          content: "Je n'ai pas pu récupérer tes repas.",
        },
      ],
      conversationId: undefined,
    });
    mealsServiceMock.findRange.mockRejectedValue(new Error('DB down'));

    const result = await service.chat(42, "Qu'est-ce que j'ai mangé ?");

    expect(mistralMock.beta.conversations.append).toHaveBeenCalledWith({
      conversationAppendRequest: {
        inputs: [
          {
            toolCallId: 'call_3',
            result: JSON.stringify({
              success: false,
              error: 'Invalid arguments for get_meals',
            }),
          },
        ],
      },
    });
    expect(result.message).toBe("Je n'ai pas pu récupérer tes repas.");

    consoleErrorSpy.mockRestore();
  });

  it('should call getDashboard with the correct userId and dates when get_analytics is requested', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      outputs: [
        {
          type: 'function.call',
          name: 'get_analytics',
          toolCallId: 'call_3',
          arguments: JSON.stringify({
            period: { from: '2026-09-21', to: '2026-09-28' },
          }),
        },
      ],
      conversationId: 'conv_442',
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      outputs: [
        {
          type: 'message.output',
          content: 'Voici tes statistiques.',
        },
      ],
      conversationId: 'conv_442',
    });
    dashboardAnalyticsServiceMock.getDashboard.mockResolvedValue({});

    const result = await service.chat(42, 'Montre-moi mes statistiques');

    expect(dashboardAnalyticsServiceMock.getDashboard).toHaveBeenCalledWith(
      42,
      new Date('2026-09-21'),
      new Date('2026-09-28'),
    );
    expect(result.message).toBe('Voici tes statistiques.');
  });

  it('should call getWeightHistory with the correct userId and dates when get_weight_history is requested', async () => {
    mistralMock.beta.conversations.start.mockResolvedValue({
      outputs: [
        {
          type: 'function.call',
          name: 'get_weight_history',
          toolCallId: 'call_3',
          arguments: JSON.stringify({
            period: { from: '2026-09-21', to: '2026-09-28' },
          }),
        },
      ],
      conversationId: 'conv_442',
    });
    mistralMock.beta.conversations.append.mockResolvedValue({
      outputs: [
        {
          type: 'message.output',
          content: 'Voici ton historique de poids.',
        },
      ],
      conversationId: 'conv_442',
    });
    aiContextServiceMock.getWeightHistory.mockResolvedValue([
      { date: '2026-09-21', weight: 70 },
    ]);

    const result = await service.chat(42, 'Montre-moi mon historique de poids');

    expect(aiContextServiceMock.getWeightHistory).toHaveBeenCalledWith(
      42,
      '2026-09-21',
      '2026-09-28',
      // new Date('2026-09-21T00:00:00.000Z'),
      // new Date('2026-09-28T00:00:00.000Z'),
    );
    expect(result.message).toBe('Voici ton historique de poids.');
  });
});
