import { Plus, Search } from 'lucide-react';

import { Input } from '../ui/Input';

interface MealListProps {
  onAdd: () => void;
}

export default function MealList({ onAdd }: MealListProps) {
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
      <p className="px-5 py-10 text-center text-sm text-green-400">
        Aucun repas pour l&apos;instant.
      </p>
    </div>
  );
}
