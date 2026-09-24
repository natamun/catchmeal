import type { LucideIcon } from 'lucide-react';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';
import { useEffect, useRef } from 'react';

interface ToastProps {
  message: string | null;
  icon: LucideIcon;
}

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
      className="pointer-events-none fixed inset-x-0 top-4 bottom-auto z-50 m-0 h-auto w-auto flex justify-center border-0 bg-transparent p-0 px-4"
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
