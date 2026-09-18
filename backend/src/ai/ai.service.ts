import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Mistral as MistralClient } from '@mistralai/mistralai';
import {
  ConversationResponse,
  FunctionResultEntry,
} from '@mistralai/mistralai/models/components';
import { z } from 'zod';

import { CreateMealDto } from '../meals/dto/create-meal.dto';
import { MealsService } from '../meals/meals.service';

const addMealArgsSchema = z.object({
  name: z.string().min(1).max(30),
  calories: z.number().positive().max(5000),
  protein: z.number().positive().max(100),
  carbs: z.number().positive().max(100),
  fat: z.number().positive().max(100),
  quantity: z.number().positive().max(100),
  // baseUnit: z.enum(['GRAM', 'PIECE']),
  // brand: z.string().min(1).max(30).optional(),
});

@Injectable()
export class AiService implements OnModuleInit {
  private mistral!: MistralClient;

  constructor(private mealsService: MealsService) {}

  async onModuleInit() {
    const { Mistral } = await import('@mistralai/mistralai');
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set');
    }
    this.mistral = new Mistral({ apiKey });
  }

  async chat(userId: number, message: string, conversationId?: string) {
    let result: ConversationResponse;

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

    while (output.type === 'function.call') {
      if (output.name === 'add_meal') {
        const rawArgs = output.arguments;
        const args: unknown =
          typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
        const validated = addMealArgsSchema.safeParse(args);

        if (!validated.success) {
          const errorEntry: FunctionResultEntry = {
            toolCallId: output.toolCallId,
            result: JSON.stringify({
              success: false,
              error: 'Invalid arguments for add_meal',
              details: validated.error.issues,
            }),
          };

          result = await this.mistral.beta.conversations.append({
            conversationId: result.conversationId,
            conversationAppendRequest: {
              inputs: [errorEntry],
            },
          });
        } else {
          const dto: CreateMealDto = {
            name: validated.data.name,
            items: [
              {
                quantity: validated.data.quantity,
                kcal: validated.data.calories,
                protein: validated.data.protein,
                carbs: validated.data.carbs,
                fat: validated.data.fat,
              },
            ],
          };
          try {
            const meal = await this.mealsService.create(userId, dto);
            const succesEntry: FunctionResultEntry = {
              toolCallId: output.toolCallId,
              result: JSON.stringify({ success: true, meal }),
            };
            result = await this.mistral.beta.conversations.append({
              conversationId: result.conversationId,
              conversationAppendRequest: {
                inputs: [succesEntry],
              },
            });
          } catch (error) {
            console.error('mealService.creat failed: ', error);
            const errorEntry: FunctionResultEntry = {
              toolCallId: output.toolCallId,
              result: JSON.stringify({
                success: false,
                error: 'Failed to save meal to database.',
              }),
            };

            result = await this.mistral.beta.conversations.append({
              conversationId: result.conversationId,
              conversationAppendRequest: {
                inputs: [errorEntry],
              },
            });
          }
        }
      } else {
        const errorEntry: FunctionResultEntry = {
          toolCallId: output.toolCallId,
          result: JSON.stringify({
            success: false,
            error: 'Invalid function call.',
          }),
        };
        result = await this.mistral.beta.conversations.append({
          conversationId: result.conversationId,
          conversationAppendRequest: {
            inputs: [errorEntry],
          },
        });
      }
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
  }
}
