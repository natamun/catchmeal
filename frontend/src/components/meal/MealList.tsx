import { LoaderCircle, Plus, Search } from 'lucide-react';

import { Input } from '../ui/Input';
import type { Meal } from './types';

interface MealListProps {
  meals: Meal[];
  isLoading: boolean;
  loadError: string | null;
  onAdd: () => void;
}

function totalKcal(meal: Meal) {
  return meal.items.reduce((sum, item) => sum + item.kcal, 0);
}

export default function MealList({
  meals,
  isLoading,
  loadError,
  onAdd,
}: MealListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-green-200 px-5 py-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-green-400" />
          <Input
            type="text"
            placeholder="Rechercher un repas..."
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Ajouter un repas"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div role="status" className="flex justify-center py-10">
          <LoaderCircle className="h-6 w-6 animate-spin text-green-400" />
          <span className="sr-only">Chargement des repas...</span>
        </div>
      )}

      {loadError && (
        <p className="px-5 pb-5 text-sm text-red-500">{loadError}</p>
      )}

      {!isLoading && !loadError && meals.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-green-400">
          Aucun repas pour l&apos;instant.
        </p>
      )}

      <ul className="divide-y divide-green-200">
        {meals.map((meal) => (
          <li key={meal.id} className="flex items-center gap-3 px-5 py-4">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-green-800">
              {meal.name ?? 'Repas sans nom'}
            </p>
            <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-800">
              {totalKcal(meal)} kcal
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
