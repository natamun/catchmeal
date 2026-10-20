export type QuantityUnit = 'GRAM' | 'MILLILITER' | 'PIECE';

/** Short unit written after a quantity; "x" means pieces. */
export const UNIT_LABELS: Record<QuantityUnit, string> = {
  GRAM: 'g',
  MILLILITER: 'ml',
  PIECE: 'x',
};

/**
 * A food of the user's library. kcal and macros are given for baseQuantity of
 * baseUnit (e.g. per 100 g). An archived food is hidden from the lists but kept
 * for the meals that use it.
 */
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

/**
 * A product found on Open Food Facts. A null value is missing on their side;
 * the form leaves that field empty.
 */
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
