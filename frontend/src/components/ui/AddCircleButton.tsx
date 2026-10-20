import { Plus } from 'lucide-react';

interface AddCircleButtonProps {
  label: string;
  onClick: () => void;
}

/**
 * Round green "+" button. It only shows an icon, so `label` is what screen
 * readers announce.
 */
export function AddCircleButton({ label, onClick }: AddCircleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600"
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
