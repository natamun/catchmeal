import { createContext, useContext } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ShowToast = (message: string, icon?: LucideIcon) => void;

export const ToastContext = createContext<ShowToast | null>(null);

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return showToast;
}
