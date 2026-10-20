import { CloudOff, RotateCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

/**
 * Block shown when data could not be loaded, with a "Réessayer" button when
 * `onRetry` is given.
 */
export function LoadError({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 px-5 py-8 text-center"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
        <CloudOff className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm text-green-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      )}
    </div>
  );
}
