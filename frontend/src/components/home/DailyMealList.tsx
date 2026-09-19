import { Plus } from 'lucide-react';

import { MEAL_TYPE_LABELS, type MealType } from '../meal/types';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

interface DailyMealListProps {
  onAdd: (mealType: MealType) => void;
}

export default function DailyMealList({ onAdd }: DailyMealListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="divide-y divide-green-200">
        {MEAL_TYPES.map((mealType) => (
          <div
            key={mealType}
            className="flex items-center justify-between gap-3 px-5 py-4"
          >
            <h3 className="text-sm font-medium text-green-500">
              {MEAL_TYPE_LABELS[mealType]}
            </h3>
            <button
              type="button"
              onClick={() => onAdd(mealType)}
              aria-label={`Ajouter à la catégorie ${MEAL_TYPE_LABELS[mealType]}`}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
