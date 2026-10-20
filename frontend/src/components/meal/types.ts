export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
};

export interface MealFoodItem {
  id: number;
  foodItemId: number | null;
  quantity: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: number;
  name: string | null;
  typeMeal: MealType | null;
  loggedAt: string | null;
  items: MealFoodItem[];
}

export interface MealItemInput {
  foodItemId?: number;
  quantity: number;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealInput {
  name?: string;
  typeMeal?: MealType;
  loggedAt?: string;
  items: MealItemInput[];
}

export function mealTotals(meal: Meal) {
  return meal.items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
