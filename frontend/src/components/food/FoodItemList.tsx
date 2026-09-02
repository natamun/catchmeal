import { LoaderCircle, Pencil, Plus, Search } from 'lucide-react';

import type { FoodItem } from './types';

interface FoodItemListProps {
  items: FoodItem[];
  isLoading: boolean;
  loadError: string | null;
  onAdd: () => void;
  onEdit: (item: FoodItem) => void;
}

export default function FoodItemList({
  items,
  isLoading,
  loadError,
  onAdd,
  onEdit,
}: FoodItemListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-green-200 px-5 py-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-green-400" />
          <input
            type="text"
            placeholder="Rechercher un aliment..."
            className="w-full rounded-xl border border-green-200 bg-white py-2 pr-3 pl-9 text-sm text-green-800 outline-none focus:border-green-400"
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Ajouter un aliment"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {isLoading && (
        <div role="status" className="flex justify-center py-10">
          <LoaderCircle className="h-6 w-6 animate-spin text-green-400" />
          <span className="sr-only">Chargement des aliments...</span>
        </div>
      )}

      {loadError && (
        <p className="px-5 pb-5 text-sm text-red-500">{loadError}</p>
      )}

      <ul>
        {items.map((item, i) => (
          <li
            key={item.id}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${i < items.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-sm font-semibold text-green-800">
                {item.name}
                {item.brand && (
                  <span className="ml-1.5 text-xs font-normal text-green-500">
                    {item.brand}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  `${item.kcal} kcal`,
                  `${item.protein}g prot`,
                  `${item.carbs}g gluc`,
                  `${item.fat}g lip`,
                  `pour ${item.baseQuantity}${item.baseUnit === 'GRAM' ? 'g' : ' pièce(s)'}`,
                ].map((text) => (
                  <span
                    key={text}
                    className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-green-700"
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Modifier ${item.name}`}
              className="shrink-0 cursor-pointer text-green-400 transition-colors hover:text-green-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
