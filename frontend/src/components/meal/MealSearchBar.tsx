import { useMemo, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight, Filter, Search } from 'lucide-react';

import { BaseDialog } from '../ui/BaseDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { Input } from '../ui/Input';
import {
  EMPTY_MEAL_FILTER_CRITERIA,
  mealTotals,
  type Meal,
  type MealFilterCriteria,
  type MealMacroFilter,
  type MealSortOption,
} from './types';

type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';
type MacroDraft = Record<MacroKey, MealMacroFilter>;

const MACRO_FIELDS: {
  key: MacroKey;
  label: string;
  unit: string;
  step: number;
}[] = [
  { key: 'kcal', label: 'Kcal', unit: 'kcal', step: 1 },
  { key: 'protein', label: 'Protéines', unit: 'g', step: 1 },
  { key: 'carbs', label: 'Glucides', unit: 'g', step: 1 },
  { key: 'fat', label: 'Lipides', unit: 'g', step: 1 },
];

const SORT_OPTIONS: {
  value: string;
  label: string;
  option: MealSortOption;
}[] = [
  {
    value: 'name-asc',
    label: 'Nom (A → Z)',
    option: { field: 'name', direction: 'asc' },
  },
  {
    value: 'name-desc',
    label: 'Nom (Z → A)',
    option: { field: 'name', direction: 'desc' },
  },
  {
    value: 'kcal-asc',
    label: 'Kcal (croissant)',
    option: { field: 'kcal', direction: 'asc' },
  },
  {
    value: 'kcal-desc',
    label: 'Kcal (décroissant)',
    option: { field: 'kcal', direction: 'desc' },
  },
  {
    value: 'protein-asc',
    label: 'Protéines (croissant)',
    option: { field: 'protein', direction: 'asc' },
  },
  {
    value: 'protein-desc',
    label: 'Protéines (décroissant)',
    option: { field: 'protein', direction: 'desc' },
  },
  {
    value: 'carbs-asc',
    label: 'Glucides (croissant)',
    option: { field: 'carbs', direction: 'asc' },
  },
  {
    value: 'carbs-desc',
    label: 'Glucides (décroissant)',
    option: { field: 'carbs', direction: 'desc' },
  },
  {
    value: 'fat-asc',
    label: 'Lipides (croissant)',
    option: { field: 'fat', direction: 'asc' },
  },
  {
    value: 'fat-desc',
    label: 'Lipides (décroissant)',
    option: { field: 'fat', direction: 'desc' },
  },
];

function boundsOf(meals: Meal[], key: MacroKey): MealMacroFilter {
  if (meals.length === 0) {
    return { min: 0, max: 100 };
  }
  const values = meals.map((meal) => mealTotals(meal)[key]);
  return {
    min: Math.floor(Math.min(...values)),
    max: Math.ceil(Math.max(...values)),
  };
}

function clampToBounds(
  filter: MealMacroFilter,
  bounds: MealMacroFilter,
): MealMacroFilter {
  return {
    min: Number.isFinite(filter.min) ? filter.min : bounds.min,
    max: Number.isFinite(filter.max) ? filter.max : bounds.max,
  };
}

interface MealSearchBarProps {
  meals: Meal[];
  criteria: MealFilterCriteria;
  onFilterChange: (criteria: MealFilterCriteria) => void;
}

export default function MealSearchBar({
  meals,
  criteria,
  onFilterChange,
}: MealSearchBarProps) {
  const [draftMacros, setDraftMacros] = useState<MacroDraft>(
    EMPTY_MEAL_FILTER_CRITERIA,
  );
  const [draftSort, setDraftSort] = useState<MealSortOption>(
    EMPTY_MEAL_FILTER_CRITERIA.sort,
  );
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  const macroBounds = useMemo<MacroDraft>(
    () => ({
      kcal: boundsOf(meals, 'kcal'),
      protein: boundsOf(meals, 'protein'),
      carbs: boundsOf(meals, 'carbs'),
      fat: boundsOf(meals, 'fat'),
    }),
    [meals],
  );

  const hasActiveFilters = MACRO_FIELDS.some(
    (field) =>
      criteria[field.key].min > macroBounds[field.key].min ||
      criteria[field.key].max < macroBounds[field.key].max,
  );

  const currentSortValue = `${draftSort.field}-${draftSort.direction}`;

  const openFilterDialog = () => {
    setDraftMacros({
      kcal: clampToBounds(criteria.kcal, macroBounds.kcal),
      protein: clampToBounds(criteria.protein, macroBounds.protein),
      carbs: clampToBounds(criteria.carbs, macroBounds.carbs),
      fat: clampToBounds(criteria.fat, macroBounds.fat),
    });
    setDraftSort(criteria.sort);
    filterDialogRef.current?.showModal();
  };

  const closeFilterDialog = () => {
    filterDialogRef.current?.close();
  };

  const updateQuery = (query: string) => {
    onFilterChange({ ...criteria, query });
  };

  const updateDraftMacro = (key: MacroKey, patch: Partial<MealMacroFilter>) => {
    setDraftMacros({
      ...draftMacros,
      [key]: { ...draftMacros[key], ...patch },
    });
  };

  const applyFilters = () => {
    onFilterChange({ ...criteria, ...draftMacros, sort: draftSort });
    closeFilterDialog();
  };

  const resetMacros = () => {
    setDraftMacros(macroBounds);
  };

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-green-400" />
      <Input
        type="text"
        placeholder="Rechercher un repas..."
        className="pr-10 pl-9"
        value={criteria.query}
        onChange={(e) => updateQuery(e.target.value)}
      />
      <button
        type="button"
        onClick={openFilterDialog}
        aria-label="Trier et filtrer"
        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-green-400 transition-colors hover:text-green-600"
      >
        <Filter
          className={`h-4 w-4 ${hasActiveFilters ? 'fill-green-400' : ''}`}
        />
      </button>

      <BaseDialog
        dialogRef={filterDialogRef}
        title="Trier et filtrer"
        maxWidth="sm"
        onClose={() => setIsSortOpen(false)}
        onDialogNode={setDialogNode}
      >
        <Popover.Root open={isSortOpen} onOpenChange={setIsSortOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Trier par"
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 transition-colors hover:bg-green-50"
            >
              {SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label}
              <ChevronRight
                className={`h-4 w-4 text-green-400 transition-transform ${isSortOpen ? 'rotate-90' : ''}`}
              />
            </button>
          </Popover.Trigger>
          <DropdownPanel container={dialogNode} matchAnchorWidth>
            {SORT_OPTIONS.map(({ value, label, option }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setDraftSort(option);
                  setIsSortOpen(false);
                }}
                className={`cursor-pointer border-t border-green-100 px-4 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-green-50 ${
                  value === currentSortValue
                    ? 'font-semibold text-green-800'
                    : 'text-green-600'
                }`}
              >
                {label}
              </button>
            ))}
          </DropdownPanel>
        </Popover.Root>

        <div className="flex flex-col gap-3 border-t border-green-100 pt-5">
          <div className="flex flex-col gap-5">
            {MACRO_FIELDS.map(({ key, label, unit, step }) => {
              const { min, max } = macroBounds[key];
              const minIsOnTop = draftMacros[key].min > (min + max) / 2;
              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-700">
                      {label}
                    </span>
                    <span className="text-xs text-green-500">
                      {draftMacros[key].min} – {draftMacros[key].max} {unit}
                    </span>
                  </div>
                  <div className="relative h-4">
                    <div className="absolute top-1/2 right-2 left-2 h-1.5 -translate-y-1/2 rounded-full bg-green-100" />
                    <div
                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-green-400"
                      style={{
                        left: `calc(8px + ${(draftMacros[key].min - min) / (max - min || 1)} * (100% - 16px))`,
                        right: `calc(8px + ${1 - (draftMacros[key].max - min) / (max - min || 1)} * (100% - 16px))`,
                      }}
                    />
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={draftMacros[key].min}
                      onChange={(e) =>
                        updateDraftMacro(key, {
                          min: Math.min(
                            Number(e.target.value),
                            draftMacros[key].max,
                          ),
                        })
                      }
                      aria-label={`${label}, minimum`}
                      style={{ zIndex: minIsOnTop ? 2 : 1 }}
                      className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
                    />
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={draftMacros[key].max}
                      onChange={(e) =>
                        updateDraftMacro(key, {
                          max: Math.max(
                            Number(e.target.value),
                            draftMacros[key].min,
                          ),
                        })
                      }
                      aria-label={`${label}, maximum`}
                      style={{ zIndex: minIsOnTop ? 1 : 2 }}
                      className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetMacros}
            className="cursor-pointer self-start text-xs font-medium text-green-500 underline-offset-2 hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        <button
          type="button"
          onClick={applyFilters}
          className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
        >
          Appliquer
        </button>
      </BaseDialog>
    </div>
  );
}
