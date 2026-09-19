import { useState, type ReactNode } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';

import { MACROS } from '../../constants/macros';
import { MacroBadge } from '../ui/MacroBadge';
import MealSearchBar from './MealSearchBar';
import {
  EMPTY_MEAL_FILTER_CRITERIA,
  mealTotals,
  type Meal,
  type MealFilterCriteria,
  type MealMacroFilter,
} from './types';

interface MealListProps {
  meals: Meal[];
  isLoading: boolean;
  loadError: string | null;
  headerAction?: ReactNode;
  renderAction?: (meal: Meal) => ReactNode;
}

function matchesMacro(itemValue: number, filter: MealMacroFilter) {
  return itemValue >= filter.min && itemValue <= filter.max;
}

function macrosOf(meal: Meal) {
  const totals = mealTotals(meal);

  return {
    kcal: Math.round(totals.kcal),
    macros: MACROS.map(({ key, label, color }) => ({
      label,
      color,
      value: Math.round(totals[key] * 10) / 10,
    })),
  };
}

export default function MealList({
  meals,
  isLoading,
  loadError,
  headerAction,
  renderAction,
}: MealListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [criteria, setCriteria] = useState<MealFilterCriteria>(
    EMPTY_MEAL_FILTER_CRITERIA,
  );

  const query = criteria.query.trim().toLowerCase();
  const visibleMeals = meals
    .filter((meal) => {
      const matchesQuery =
        !query || (meal.name ?? '').toLowerCase().includes(query);
      const totals = mealTotals(meal);

      return (
        matchesQuery &&
        matchesMacro(totals.kcal, criteria.kcal) &&
        matchesMacro(totals.protein, criteria.protein) &&
        matchesMacro(totals.carbs, criteria.carbs) &&
        matchesMacro(totals.fat, criteria.fat)
      );
    })
    .sort((a, b) => {
      const { field, direction } = criteria.sort;
      const dir = direction === 'asc' ? 1 : -1;
      return field === 'name'
        ? (a.name ?? '').localeCompare(b.name ?? '') * dir
        : (mealTotals(a)[field] - mealTotals(b)[field]) * dir;
    });

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="@container overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-green-200 px-5 py-4">
        <MealSearchBar
          meals={meals}
          criteria={criteria}
          onFilterChange={setCriteria}
        />
        {headerAction}
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
          Aucun repas enregistré.
        </p>
      )}

      {!isLoading &&
        !loadError &&
        meals.length > 0 &&
        visibleMeals.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-green-400">
            Aucun repas ne correspond à cette recherche.
          </p>
        )}

      <ul className="divide-y divide-green-200">
        {visibleMeals.map((meal) => {
          const isExpanded = expandedIds.has(meal.id);
          const { kcal, macros } = macrosOf(meal);
          return (
            <li key={meal.id} className="px-5 py-4 even:bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(meal.id)}
                  aria-expanded={isExpanded}
                  aria-label={`Afficher le détail de ${meal.name ?? 'ce repas'}`}
                  className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600 @lg:hidden"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-green-800">
                  {meal.name ?? 'Repas sans nom'}
                </p>
                <div className="hidden shrink-0 items-center gap-2.5 @lg:flex">
                  {macros.map((m) => (
                    <MacroBadge key={m.label} {...m} />
                  ))}
                </div>
                <span className="min-w-20 shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-center text-sm font-semibold text-green-800">
                  {kcal} kcal
                </span>
                {renderAction?.(meal)}
              </div>
              <div
                className={`grid pl-7 transition-[grid-template-rows] duration-200 ease-out @lg:hidden ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div
                  className={`flex flex-wrap items-center gap-1.5 overflow-hidden ${isExpanded ? 'pt-2' : ''}`}
                >
                  {macros.map((m) => (
                    <MacroBadge key={m.label} {...m} />
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
