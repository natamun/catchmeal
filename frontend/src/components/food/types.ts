export type QuantityUnit = 'GRAM' | 'PIECE';

export interface FoodItem {
  id: number;
  name: string;
  brand: string | null;
  baseQuantity: number;
  baseUnit: QuantityUnit;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type FoodItemInput = Omit<FoodItem, 'id'>;
