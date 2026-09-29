import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Mistral as MistralClient } from '@mistralai/mistralai';
import type {
  ConversationResponse,
  FunctionCallEntry,
  FunctionResultEntry,
} from '@mistralai/mistralai/models/components';

import { MealsService } from '../meals/meals.service';
import { getMealsArgs, todayInZurich } from './utils/date-range';
import { sumMeals } from './utils/sum-meals';

const MAX_TOOL_ROUNDS = 6;

const ERROR_MESSAGE =
  "Erreur rencontrée lors de la liaison avec l'assistant, veuillez réessayer plus tard.";

function buildDatePrefix(now: Date = new Date()): string {
  const zone = 'Europe/Zurich';
  const weekday = now.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: zone,
  });
  const time = now.toLocaleTimeString('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
  });
  return `[Current date: ${weekday} ${todayInZurich(now)}, ${time} (${zone})]`;
}

@Injectable()
export class AiService implements OnModuleInit {
  private mistral!: MistralClient;
  private conversationByUser = new Map<number, string>();

  constructor(private mealsService: MealsService) {}

  async onModuleInit() {
    const { Mistral } = await import('@mistralai/mistralai');
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set');
    }
    this.mistral = new Mistral({ apiKey });
  }

  private errorResult(
    output: FunctionCallEntry,
    error: string,
  ): FunctionResultEntry {
    return {
      toolCallId: output.toolCallId,
      result: JSON.stringify({ success: false, error }),
    };
  }

  private async handleGetMeals(
    userId: number,
    output: FunctionCallEntry,
  ): Promise<FunctionResultEntry> {
    const rawArgs = output.arguments;

    let args: unknown;
    try {
      args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
    } catch {
      return this.errorResult(output, 'Arguments are not valid JSON.');
    }

    const validated = getMealsArgs.safeParse(args);
    if (!validated.success) {
      return this.errorResult(output, 'Invalid arguments for get_meals');
    }

    const { from, to, fromDay, toDay } = validated.data.period;

    try {
      const meals = await this.mealsService.findRange(userId, from, to);
      return {
        toolCallId: output.toolCallId,
        result: JSON.stringify({
          success: true,
          range: { from: fromDay, to: toDay },
          meals: sumMeals(meals),
        }),
      };
    } catch (error) {
      console.error('mealsService.findRange failed: ', error);
      return this.errorResult(
        output,
        'Failed to retrieve meals from database.',
      );
    }
  }

  async chat(userId: number, message: string) {
    const input = `${buildDatePrefix()}\n${message}`;
    const conversationId = this.conversationByUser.get(userId);

    try {
      let result: ConversationResponse;

      if (!conversationId) {
        result = await this.mistral.beta.conversations.start({
          inputs: input,
          agentId: process.env.MISTRAL_AGENT_ID,
        });
        this.conversationByUser.set(userId, result.conversationId);
      } else {
        result = await this.mistral.beta.conversations.append({
          conversationId,
          conversationAppendRequest: { inputs: input },
        });
      }

      let functionResult: FunctionResultEntry;
      let output = result.outputs[result.outputs.length - 1];
      let rounds = 0;

      while (output.type === 'function.call' && rounds < MAX_TOOL_ROUNDS) {
        rounds++;

        if (output.name === 'get_meals') {
          functionResult = await this.handleGetMeals(userId, output);
        } else {
          functionResult = this.errorResult(output, 'Invalid function call.');
        }

        result = await this.mistral.beta.conversations.append({
          conversationId: result.conversationId,
          conversationAppendRequest: { inputs: [functionResult] },
        });
        output = result.outputs[result.outputs.length - 1];
      }

      if (output.type !== 'message.output') {
        throw new Error('Unexpected output type from Mistral');
      }

      return {
        message: output.content,
        conversationId: result.conversationId,
      };
    } catch (err) {
      console.error('Error: ', err);
      this.conversationByUser.delete(userId);
      return { message: ERROR_MESSAGE, conversationId: null };
    }
  }
}
