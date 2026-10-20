import { X } from 'lucide-react';

import { UNIT_LABELS } from '../food/types';
import { QuantityStepper } from '../ui/QuantityStepper';
import type { MealItemDraft } from './draft';

const ROW_CLASS =
  'flex animate-fade-in-up items-center gap-2 rounded-xl border border-green-200 px-3 py-1.5';

const REMOVE_CLASS =
  'shrink-0 cursor-pointer text-green-400 transition-colors hover:text-red-500';

interface DraftItemListProps {
  items: MealItemDraft[];
  onAdjust: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function DraftItemList({
  items,
  onAdjust,
  onRemove,
  className = '',
}: DraftItemListProps) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => {
        if (item.kind === 'quick') {
          return (
            <li key={item.id} className={ROW_CLASS}>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-green-800">
                {Math.round(item.kcal)} kcal
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Retirer cet ajout rapide"
                className={REMOVE_CLASS}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        }

        const { foodItem, quantity } = item;
        return (
          <li key={item.id} className={ROW_CLASS}>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-green-800">
              {foodItem.name}
            </span>
            <QuantityStepper
              name={foodItem.name}
              quantity={quantity}
              unitLabel={UNIT_LABELS[foodItem.baseUnit]}
              onAdjust={(delta) => onAdjust(item.id, delta)}
            />
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Retirer ${foodItem.name}`}
              className={REMOVE_CLASS}
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
