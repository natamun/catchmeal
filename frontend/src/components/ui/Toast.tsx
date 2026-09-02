import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ToastProps {
  message: string | null;
  icon: LucideIcon;
}

export function Toast({ message, icon: Icon }: ToastProps) {
  const [displayedMessage, setDisplayedMessage] = useState(message);

  if (message && message !== displayedMessage) {
    setDisplayedMessage(message);
  }

  useEffect(() => {
    if (message) {
      return;
    }
    const timeoutId = setTimeout(() => setDisplayedMessage(null), 150);
    return () => clearTimeout(timeoutId);
  }, [message]);

  if (!displayedMessage) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        className={`flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-medium text-green-800 shadow-lg ${message ? 'animate-toast-in' : 'animate-toast-out'}`}
      >
        <Icon className="h-4 w-4 shrink-0 text-green-500" />
        {displayedMessage}
      </div>
    </div>
  );
}
