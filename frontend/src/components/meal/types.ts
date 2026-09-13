export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealFoodItem {
  id: number;
  foodItemId: number;
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
  foodItemId: number;
  quantity: number;
}

export interface MealInput {
  name?: string;
  typeMeal?: MealType;
  loggedAt?: string;
  items: MealItemInput[];
}
