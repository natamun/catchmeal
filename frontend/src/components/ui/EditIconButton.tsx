import { Pencil } from 'lucide-react';

interface EditIconButtonProps {
  label: string;
  onClick: () => void;
}

export function EditIconButton({ label, onClick }: EditIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-green-400 transition-colors hover:text-green-600"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}
