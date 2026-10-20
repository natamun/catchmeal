export type QuantityUnit = 'GRAM' | 'MILLILITER' | 'PIECE';

export const UNIT_LABELS: Record<QuantityUnit, string> = {
  GRAM: 'g',
  MILLILITER: 'ml',
  PIECE: 'x',
};

export interface FoodItem {
  id: number;
  name: string;
  brand: string | null;
  barcode: string | null;
  baseQuantity: number;
  baseUnit: QuantityUnit;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  archived: boolean;
}

export type FoodItemInput = Omit<FoodItem, 'id' | 'archived'>;

export interface OffProduct {
  barcode: string;
  name: string | null;
  brand: string | null;
  baseQuantity: number;
  baseUnit: QuantityUnit;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}
