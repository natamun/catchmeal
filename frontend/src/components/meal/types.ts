export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

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

export interface MealMacroFilter {
  min: number;
  max: number;
}

export type MealSortField = 'name' | 'kcal' | 'protein' | 'carbs' | 'fat';
export type MealSortDirection = 'asc' | 'desc';

export interface MealSortOption {
  field: MealSortField;
  direction: MealSortDirection;
}

export interface MealFilterCriteria {
  query: string;
  kcal: MealMacroFilter;
  protein: MealMacroFilter;
  carbs: MealMacroFilter;
  fat: MealMacroFilter;
  sort: MealSortOption;
}

export const EMPTY_MEAL_FILTER_CRITERIA: MealFilterCriteria = {
  query: '',
  kcal: { min: -Infinity, max: Infinity },
  protein: { min: -Infinity, max: Infinity },
  carbs: { min: -Infinity, max: Infinity },
  fat: { min: -Infinity, max: Infinity },
  sort: { field: 'name', direction: 'asc' },
};

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
