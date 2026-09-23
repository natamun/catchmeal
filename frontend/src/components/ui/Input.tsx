import { forwardRef, type ComponentProps } from 'react';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={`w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 aria-invalid:border-red-400 ${className}`}
    />
  ),
);
Input.displayName = 'Input';
