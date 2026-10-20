export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
};

/**
 * One line of a saved meal. foodItemId is null for a quick add. Calories and
 * macros are stored when the meal is saved, so editing the food later does not
 * change past meals.
 */
export interface MealFoodItem {
  id: number;
  foodItemId: number | null;
  quantity: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * A meal. With a loggedAt date it belongs to the journal; with loggedAt null it
 * is a library meal, reused later.
 */
export interface Meal {
  id: number;
  name: string | null;
  typeMeal: MealType | null;
  loggedAt: string | null;
  items: MealFoodItem[];
}

/**
 * An item sent to the API: a food id with a quantity, or for a quick add the
 * quantity and the macros.
 */
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

/** Calories and macros of a meal: the sum of its items. */
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
