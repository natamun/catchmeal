import { AlertCircle } from 'lucide-react';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';

export function FieldError({ id, message }: { id: string; message?: string }) {
  const displayedMessage = useDelayedUnmount(message, 100);

  if (!displayedMessage) {
    return null;
  }

  return (
    <div
      id={id}
      className={`absolute top-full left-0 z-10 mt-2 ${message ? 'animate-fade-in-up' : 'animate-fade-out'}`}
    >
      <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 border-t border-l border-red-200 bg-red-50" />
      <div className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs whitespace-nowrap text-red-600 shadow-sm">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {displayedMessage}
      </div>
    </div>
  );
}
