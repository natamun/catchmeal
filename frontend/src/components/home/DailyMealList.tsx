import { useState } from 'react';
import { LoaderCircle, Plus } from 'lucide-react';

import type { FoodItem } from '../food/types';
import { MEAL_TYPE_LABELS, type Meal, type MealType } from '../meal/types';
import { EditIconButton } from '../ui/EditIconButton';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

interface JournalRow {
  key: string;
  label: string;
  kcal: number;
}

function rowsOf(sectionMeals: Meal[], foodItems: FoodItem[]): JournalRow[] {
  const rows: JournalRow[] = [];
  const rowByFoodId = new Map<number, JournalRow>();

  for (const meal of sectionMeals) {
    for (const item of meal.items) {
      if (item.foodItemId === null) {
        rows.push({
          key: `${meal.id}-${item.id}`,
          label: 'Ajout rapide',
          kcal: item.kcal,
        });
        continue;
      }

      const existing = rowByFoodId.get(item.foodItemId);
      if (existing) {
        existing.kcal += item.kcal;
        continue;
      }

      const row: JournalRow = {
        key: `food-${item.foodItemId}`,
        label:
          foodItems.find((food) => food.id === item.foodItemId)?.name ??
          'Aliment inconnu',
        kcal: item.kcal,
      };
      rowByFoodId.set(item.foodItemId, row);
      rows.push(row);
    }
  }

  return rows;
}

interface DailyMealListProps {
  meals: Meal[];
  foodItems: FoodItem[];
  isLoading: boolean;
  loadError: string | null;
  onAdd: (mealType: MealType) => void;
  onEdit: (mealType: MealType) => void;
}

export default function DailyMealList({
  meals,
  foodItems,
  isLoading,
  loadError,
  onAdd,
  onEdit,
}: DailyMealListProps) {
  const [loadedMeals, setLoadedMeals] = useState(meals);

  if (!isLoading && loadedMeals !== meals) {
    setLoadedMeals(meals);
  }

  const editableMeals = isLoading ? loadedMeals : meals;

  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      {isLoading && (
        <span role="status" className="sr-only">
          Chargement du journal...
        </span>
      )}

      {loadError && (
        <p className="border-b border-green-200 px-5 py-3 text-sm text-red-500">
          {loadError}
        </p>
      )}

      <div aria-busy={isLoading} className="divide-y divide-green-200">
        {MEAL_TYPES.map((mealType) => {
          const rows = rowsOf(
            meals
              .filter((meal) => meal.typeMeal === mealType)
              .sort((a, b) => a.id - b.id),
            foodItems,
          );
          const total = rows.reduce((sum, row) => sum + row.kcal, 0);
          const canEdit = editableMeals.some(
            (meal) => meal.typeMeal === mealType && meal.items.length > 0,
          );

          return (
            <div key={mealType}>
              <div
                className={`flex items-center justify-between gap-3 px-5 py-4 ${rows.length > 0 ? 'border-b border-green-100' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-green-500">
                    {MEAL_TYPE_LABELS[mealType]}
                  </h3>
                  {canEdit && (
                    <div className="animate-fade-in-up">
                      <EditIconButton
                        label={`Modifier ${MEAL_TYPE_LABELS[mealType]}`}
                        onClick={() => {
                          if (!isLoading) {
                            onEdit(mealType);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {rows.length > 0 && (
                    <span className="animate-fade-in-up text-sm font-semibold text-green-800 max-2xs:hidden">
                      {Math.round(total)} kcal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onAdd(mealType)}
                    aria-label={`Ajouter à la catégorie ${MEAL_TYPE_LABELS[mealType]}`}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isLoading && (
                <div
                  aria-hidden="true"
                  className="flex h-12 animate-delayed-reveal items-center justify-center overflow-hidden border-t border-green-100"
                >
                  <LoaderCircle className="h-5 w-5 animate-spin text-green-400" />
                </div>
              )}

              {rows.length > 0 && (
                <ul className="animate-fade-in-up divide-y divide-green-100 px-5 py-2">
                  {rows.map((row) => (
                    <li
                      key={row.key}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-green-800">
                        {row.label}
                      </span>
                      <span className="shrink-0 text-sm text-green-600">
                        {Math.round(row.kcal)} kcal
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
