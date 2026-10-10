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

export interface MacroFilter {
  min: number;
  max: number;
}

export type SortField = 'name' | 'kcal' | 'protein' | 'carbs' | 'fat';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export interface FoodFilterCriteria {
  query: string;
  kcal: MacroFilter;
  protein: MacroFilter;
  carbs: MacroFilter;
  fat: MacroFilter;
  sort: SortOption;
}

export const EMPTY_FILTER_CRITERIA: FoodFilterCriteria = {
  query: '',
  kcal: { min: -Infinity, max: Infinity },
  protein: { min: -Infinity, max: Infinity },
  carbs: { min: -Infinity, max: Infinity },
  fat: { min: -Infinity, max: Infinity },
  sort: { field: 'name', direction: 'asc' },
};
