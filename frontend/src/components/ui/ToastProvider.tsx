import { useCallback, useState, type ReactNode } from 'react';
import { CheckCircle2, type LucideIcon } from 'lucide-react';

import { useTimeout } from '../../hooks/useTimeout';
import { Toast } from './Toast';
import { ToastContext, type ShowToast } from './toastContext';

const TOAST_DURATION_MS = 3000;

/**
 * Displays one toast at a time for the logged-in part of the app; a new message
 * replaces the current one. It vanishes after 3 seconds.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string | null;
    icon: LucideIcon;
  }>({ message: null, icon: CheckCircle2 });

  // Only the message is cleared: the icon must stay during the fade-out
  // animation.
  useTimeout(
    () => setToast((current) => ({ ...current, message: null })),
    toast.message ? TOAST_DURATION_MS : null,
  );

  const showToast = useCallback<ShowToast>(
    (message, icon = CheckCircle2) => setToast({ message, icon }),
    [],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={toast.message} icon={toast.icon} />
    </ToastContext.Provider>
  );
}
