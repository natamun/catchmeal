import { useCallback, useState, type ReactNode } from 'react';
import { CheckCircle2, type LucideIcon } from 'lucide-react';

import { useTimeout } from '../../hooks/useTimeout';
import { Toast } from './Toast';
import { ToastContext, type ShowToast } from './toast-context';

const TOAST_DURATION_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string | null;
    icon: LucideIcon;
  }>({ message: null, icon: CheckCircle2 });

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
