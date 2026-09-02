import { type RefObject } from 'react';
import { Plus } from 'lucide-react';

import type { FoodItem } from './types';

interface FoodItemListProps {
  items: FoodItem[];
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export default function FoodItemList({ items, dialogRef }: FoodItemListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <p className="text-xs font-semibold tracking-wide text-green-500 uppercase">
          {items.length} aliment{items.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label="Ajouter un aliment"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <ul>
        {items.map((item, i) => (
          <li
            key={item.id}
            className={`flex items-center justify-between gap-4 px-5 py-4 ${i < items.length - 1 ? 'border-b border-green-200' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-800">
                {item.name}
                {item.brand && (
                  <span className="ml-1.5 text-xs font-normal text-green-500">
                    {item.brand}
                  </span>
                )}
              </p>
              <p className="text-xs text-green-500">
                {item.kcal} kcal · {item.protein}g prot · {item.carbs}g gluc ·{' '}
                {item.fat}g lip — pour {item.baseQuantity}
                {item.baseUnit === 'GRAM' ? 'g' : ' pièce(s)'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
