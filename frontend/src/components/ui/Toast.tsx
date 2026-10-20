import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';

interface ToastProps {
  message: string | null;
  icon: LucideIcon;
}

/**
 * The toast itself, displayed by ToastProvider. It uses the popover API, which
 * puts it in the browser's top layer, above any open dialog.
 */
export function Toast({ message, icon: Icon }: ToastProps) {
  const displayedMessage = useDelayedUnmount(message, 150);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    popoverRef.current?.togglePopover(Boolean(displayedMessage));
  }, [displayedMessage]);

  return (
    <div
      ref={popoverRef}
      popover="manual"
      role="status"
      className="pointer-events-none fixed inset-x-0 top-4 bottom-auto z-50 m-0 flex h-auto w-auto justify-center border-0 bg-transparent p-0 px-4"
    >
      {displayedMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-medium text-green-800 shadow-lg ${message ? 'animate-toast-in' : 'animate-toast-out'}`}
        >
          <Icon className="h-4 w-4 shrink-0 text-green-500" />
          {displayedMessage}
        </div>
      )}
    </div>
  );
}
