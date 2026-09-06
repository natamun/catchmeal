import type { ComponentProps } from 'react';

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 aria-invalid:border-red-400 ${className}`}
    />
  );
}
