import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Mistral as MistralClient } from '@mistralai/mistralai';
import {
  ConversationResponse,
  FunctionCallEntry,
  FunctionResultEntry,
} from '@mistralai/mistralai/models/components';
import { z } from 'zod';

import { MealsService } from '../meals/meals.service';

type selectedDate = { from: Date; to: Date };

const getStatsArgs = z.object({
  period: z.enum(['day', 'week', 'month', '3month']),
});

function calculateFromDate(period: string): selectedDate {
  let fromDate: Date;
  const now = new Date();
  switch (period) {
    case 'day':
      fromDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      fromDate = new Date(new Date().setDate(new Date().getDate() - 7));
      break;
    case 'month':
      fromDate = new Date(new Date().setDate(new Date().getDate() - 30));
      break;
    case '3month':
      fromDate = new Date(new Date().setMonth(new Date().getMonth() - 3));
      break;
    default:
      fromDate = new Date(new Date().setDate(new Date().getDate() - 3));
      break;
  }
  const from = new Date(new Date(fromDate).setHours(0, 0, 0, 0));
  return { from, to: now };
}

@Injectable()
export class AiService implements OnModuleInit {
  private mistral!: MistralClient;

  constructor(private mealsService: MealsService) {}

  async onModuleInit() {
    const { Mistral } = await import('@mistralai/mistralai');
    // const { Mistral } = (await import('@mistralai/mistralai')) as typeof import('@mistralai/mistralai');
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set');
    }
    this.mistral = new Mistral({ apiKey });
  }

  private async handleGetMeals(
    userId: number,
    output: FunctionCallEntry,
  ): Promise<FunctionResultEntry> {
    let functionResult: FunctionResultEntry;
    const rawArgs = output.arguments;
    const args: unknown =
      typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
    const validated = getStatsArgs.safeParse(args);

    if (!validated.success) {
      functionResult = {
        toolCallId: output.toolCallId,
        result: JSON.stringify({
          success: false,
          error: 'Invalid arguments for add_meal',
          details: validated.error.issues,
        }),
      };
    } else {
      const period = validated.data.period;
      const selectedDate = calculateFromDate(period);

      try {
        const data = await this.mealsService.findRange(
          userId,
          selectedDate.from,
          selectedDate.to,
        );
        functionResult = {
          toolCallId: output.toolCallId,
          result: JSON.stringify({ success: true, meals: data }),
        };
      } catch (error) {
        console.error('mealService.findRange failed: ', error);
        functionResult = {
          toolCallId: output.toolCallId,
          result: JSON.stringify({
            success: false,
            error: 'Failed to retrieve meals from database.',
          }),
        };
      }
    }
    return functionResult;
  }

  async chat(userId: number, message: string, conversationId?: string) {
    let result: ConversationResponse;

    try {
      if (!conversationId) {
        result = await this.mistral.beta.conversations.start({
          inputs: message,
          agentId: process.env.MISTRAL_AGENT_ID,
        });
      } else {
        result = await this.mistral.beta.conversations.append({
          conversationId: conversationId,
          conversationAppendRequest: {
            inputs: message,
          },
        });
      }

      let output = result.outputs[result.outputs.length - 1];
      let functionResult: FunctionResultEntry;

      while (output.type === 'function.call') {
        if (output.name === 'get_meals') {
          functionResult = await this.handleGetMeals(userId, output);
        } else {
          functionResult = {
            toolCallId: output.toolCallId,
            result: JSON.stringify({
              success: false,
              error: 'Invalid function call.',
            }),
          };
        }
        result = await this.mistral.beta.conversations.append({
          conversationId: result.conversationId,
          conversationAppendRequest: {
            inputs: [functionResult],
          },
        });
        output = result.outputs[result.outputs.length - 1];
      }

      if (output.type !== 'message.output') {
        throw new Error('Unexpected output type from Mistral');
      }

      const responseMistral = {
        message: output.content,
        conversationId: result.conversationId,
      };

      return responseMistral;
    } catch (err) {
      console.error('Error: ', err);
      const responseError = {
        message:
          'Erreur rencontrée lors de la liaison avec Mistral, veuillez réessayer plus tard.',
        conversationId: null,
      };
      return responseError;
    }
  }
}
