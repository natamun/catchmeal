import { forwardRef, type ComponentProps } from 'react';

/**
 * Text input in the app's style; its border turns red when aria-invalid is
 * true. The ref is forwarded so a form can focus it.
 */
export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 aria-invalid:border-red-400 ${className}`}
    />
  ),
);
Input.displayName = 'Input';
