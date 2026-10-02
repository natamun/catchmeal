import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Mistral as MistralClient } from '@mistralai/mistralai';
import type {
  ConversationResponse,
  FunctionCallEntry,
  FunctionResultEntry,
} from '@mistralai/mistralai/models/components';

import { DashboardAnalyticsService } from '../dashboard-analytics/dashboard-analytics.service';
import { MealsService } from '../meals/meals.service';
import { getArgs, todayInZurich } from './utils/date-range';
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

  constructor(
    private readonly mealsService: MealsService,
    private readonly analyticsService: DashboardAnalyticsService,
  ) {}

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

  private chooseFunctionCall(
    userId: number,
    output: FunctionCallEntry,
  ): Promise<FunctionResultEntry> {
    switch (output.name) {
      case 'get_meals':
        return this.handleGetMeals(userId, output);
      case 'get_analytics':
        return this.handleGetAnalytics(userId, output);
      default:
        return Promise.resolve(
          this.errorResult(output, 'Invalid function call.'),
        );
    }
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

    const validated = getArgs.safeParse(args);
    if (!validated.success) {
      return this.errorResult(output, 'Invalid arguments for get_meals');
    }

    const { from, to, fromDay, toDay } = validated.data.period;

    try {
      const meals = await this.mealsService.findRange(userId, from, to);
      console.log('#### DEBUG - Tool call ID: ', output.toolCallId);
      return {
        toolCallId: output.toolCallId,
        result: JSON.stringify({
          success: true,
          range: { from: fromDay, to: toDay },
          meals: sumMeals(meals),
        }),
      };
    } catch (error) {
      console.error('mealsService.findRange failed: ', error, 'Tool call ID: ', output.toolCallId);
      return this.errorResult(
        output,
        'Failed to retrieve meals from database.',
      );
    }
  }

  private async handleGetAnalytics(
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

    const validated = getArgs.safeParse(args);
    if (!validated.success) {
      // console.log('Invalid arguments for get_analytics: ', args);
      return this.errorResult(output, 'Invalid arguments for get_analytics');
    }

    const { from, to, fromDay, toDay } = validated.data.period;

    try {
      const analytics = await this.analyticsService.getDashboard(
        userId,
        from,
        to,
      );
      console.log('#### DEBUG - Tool call ID: ', output.toolCallId);
      return {
        toolCallId: output.toolCallId,
        result: JSON.stringify({
          success: true,
          range: { from: fromDay, to: toDay },
          analytics,
        }),
      };
    } catch (error) {
      console.error('analyticsService.getDashboard failed: ', error);
      return this.errorResult(
        output,
        'Failed to retrieve analytics from database.',
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

      let output = result.outputs[result.outputs.length - 1];
      let rounds = 0;

      while (output.type === 'function.call') {
        const calls = result.outputs.filter(
          (o) => o.type === 'function.call',
        ) as FunctionCallEntry[];

        if (calls.length === 0) break;

        if (++rounds > MAX_TOOL_ROUNDS) {
          throw new Error('Exceeded maximum tool call rounds.');
        }

        const functionResult: FunctionResultEntry[] = await Promise.all(
          calls.map((call) => this.chooseFunctionCall(userId, call)),
        );

        result = await this.mistral.beta.conversations.append({
          conversationId: result.conversationId,
          conversationAppendRequest: { inputs: functionResult },
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
