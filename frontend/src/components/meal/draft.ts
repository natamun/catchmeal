import type { FoodItem } from '../food/types';
import type { Meal, MealItemInput } from './types';

export type MealItemDraft =
  | { id: string; kind: 'food'; foodItem: FoodItem; quantity: number }
  | {
      id: string;
      kind: 'quick';
      quantity: number;
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    };

export function mealToItems(
  meal: Meal,
  foodItems: FoodItem[],
): MealItemDraft[] {
  const drafts: MealItemDraft[] = [];

  for (const item of meal.items) {
    if (item.foodItemId === null) {
      drafts.push({
        id: crypto.randomUUID(),
        kind: 'quick',
        quantity: item.quantity,
        kcal: item.kcal,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
      continue;
    }

    const foodItem = foodItems.find((f) => f.id === item.foodItemId);
    if (!foodItem) {
      continue;
    }

    drafts.push({
      id: crypto.randomUUID(),
      kind: 'food',
      foodItem,
      quantity: item.quantity,
    });
  }

  return drafts;
}

export function mergeDrafts(
  base: MealItemDraft[],
  extra: MealItemDraft[],
): MealItemDraft[] {
  const merged = [...base];

  for (const draft of extra) {
    if (draft.kind === 'food') {
      const index = merged.findIndex(
        (item) =>
          item.kind === 'food' && item.foodItem.id === draft.foodItem.id,
      );
      if (index !== -1) {
        const existing = merged[index];
        merged[index] = {
          ...existing,
          quantity: existing.quantity + draft.quantity,
        };
        continue;
      }
    }
    merged.push(draft);
  }

  return merged;
}

export function buildDrafts(
  foods: FoodItem[],
  meals: Meal[],
  allFoodItems: FoodItem[],
): MealItemDraft[] {
  let drafts = foods.map((foodItem): MealItemDraft => ({
    id: crypto.randomUUID(),
    kind: 'food',
    foodItem,
    quantity: foodItem.baseQuantity,
  }));

  for (const meal of meals) {
    drafts = mergeDrafts(drafts, mealToItems(meal, allFoodItems));
  }

  return drafts;
}

export function draftTotals(items: MealItemDraft[]) {
  return items.reduce(
    (acc, item) => {
      if (item.kind === 'food') {
        const scale = item.quantity / item.foodItem.baseQuantity;
        return {
          kcal: acc.kcal + item.foodItem.kcal * scale,
          protein: acc.protein + item.foodItem.protein * scale,
          carbs: acc.carbs + item.foodItem.carbs * scale,
          fat: acc.fat + item.foodItem.fat * scale,
        };
      }
      return {
        kcal: acc.kcal + item.kcal,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function draftsToInput(items: MealItemDraft[]): MealItemInput[] {
  return items.map((item) =>
    item.kind === 'food'
      ? { foodItemId: item.foodItem.id, quantity: item.quantity }
      : {
          quantity: item.quantity,
          kcal: item.kcal,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        },
  );
}
