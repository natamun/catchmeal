import { Check } from 'lucide-react';

interface SelectToggleProps {
  selected: boolean;
  label: string;
  onToggle: () => void;
}

/**
 * Square check button used to pick items in a list (role="checkbox" for screen
 * readers).
 */
export function SelectToggle({ selected, label, onToggle }: SelectToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
        selected
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-green-300 text-transparent hover:border-green-500'
      }`}
    >
      <Check className="h-4 w-4" />
    </button>
  );
}
