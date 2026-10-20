import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

import { MACROS } from '../../constants/macros';
import { roundDecimals } from '../../utils/decimals';
import { ListCard, ListCardEmpty, ListCardLoading } from '../ui/ListCard';
import { LoadError } from '../ui/LoadError';
import { MacroBadge } from '../ui/MacroBadge';
import {
  EMPTY_FILTER_CRITERIA,
  matchesMacro,
  type FilterCriteria,
} from '../ui/macroFilter';
import { MacroSearchBar } from '../ui/MacroSearchBar';
import { UNIT_LABELS, type FoodItem } from './types';

interface FoodItemListProps {
  items: FoodItem[];
  isLoading: boolean;
  loadError: string | null;
  onRetry?: () => void;
  headerAction?: ReactNode;
  renderAction?: (item: FoodItem) => ReactNode;
}

function formatBaseQuantity(item: FoodItem) {
  return `${roundDecimals(item.baseQuantity, 1)}${UNIT_LABELS[item.baseUnit]}`;
}

function macrosOf(item: FoodItem) {
  return MACROS.map(({ key, label, color }) => ({
    label,
    color,
    value: roundDecimals(item[key], 1),
  }));
}

export default function FoodItemList({
  items,
  isLoading,
  loadError,
  onRetry,
  headerAction,
  renderAction,
}: FoodItemListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [criteria, setCriteria] = useState<FilterCriteria>(
    EMPTY_FILTER_CRITERIA,
  );

  const activeItems = items.filter((item) => !item.archived);

  const query = criteria.query.trim().toLowerCase();
  const visibleItems = activeItems
    .filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query);

      return (
        matchesQuery &&
        matchesMacro(item.kcal, criteria.kcal) &&
        matchesMacro(item.protein, criteria.protein) &&
        matchesMacro(item.carbs, criteria.carbs) &&
        matchesMacro(item.fat, criteria.fat)
      );
    })
    .sort((a, b) => {
      const { field, direction } = criteria.sort;
      const dir = direction === 'asc' ? 1 : -1;
      return field === 'name'
        ? a.name.localeCompare(b.name) * dir
        : (a[field] - b[field]) * dir;
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
    <ListCard
      className="@container"
      header={
        <>
          <MacroSearchBar
            items={activeItems}
            placeholder="Rechercher un aliment..."
            criteria={criteria}
            onFilterChange={setCriteria}
          />
          {headerAction}
        </>
      }
    >
      {isLoading && <ListCardLoading label="Chargement des aliments..." />}

      {loadError && <LoadError message={loadError} onRetry={onRetry} />}

      {!isLoading && !loadError && activeItems.length === 0 && (
        <ListCardEmpty>Aucun aliment enregistré.</ListCardEmpty>
      )}

      {!isLoading &&
        !loadError &&
        activeItems.length > 0 &&
        visibleItems.length === 0 && (
          <ListCardEmpty>
            Aucun aliment ne correspond à cette recherche.
          </ListCardEmpty>
        )}

      <ul className="divide-y divide-green-200">
        {visibleItems.map((item) => {
          const isExpanded = expandedIds.has(item.id);
          const macros = macrosOf(item);
          return (
            <li key={item.id} className="px-5 py-4 even:bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.id)}
                  aria-expanded={isExpanded}
                  aria-label={`Afficher le détail de ${item.name}`}
                  className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600 @lg:hidden"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-green-800">
                  {item.name}
                  {item.brand && (
                    <span className="ml-1.5 text-xs font-normal text-green-500 @max-[400px]:hidden">
                      {item.brand}
                    </span>
                  )}
                  <span className="ml-1.5 text-xs font-normal text-green-500 @max-[400px]:hidden">
                    ({formatBaseQuantity(item)})
                  </span>
                </p>
                <div className="hidden shrink-0 items-center gap-2.5 @lg:flex">
                  {macros.map((m) => (
                    <MacroBadge key={m.label} {...m} />
                  ))}
                </div>
                <span className="min-w-20 shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-center text-sm font-semibold text-green-800">
                  {Math.round(item.kcal)} kcal
                </span>
                {renderAction?.(item)}
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
                  <span className="hidden shrink-0 items-center gap-1.5 text-xs font-normal text-green-500 @max-[400px]:flex">
                    <span aria-hidden="true" className="text-green-300">
                      |
                    </span>
                    {formatBaseQuantity(item)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </ListCard>
  );
}
