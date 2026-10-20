import { createContext, useContext } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ShowToast = (message: string, icon?: LucideIcon) => void;

export const ToastContext = createContext<ShowToast | null>(null);

/**
 * Returns showToast(message, icon?) to display a short message at the top of
 * the screen. Only works inside ToastProvider, which AppLayout provides.
 */
export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return showToast;
}
