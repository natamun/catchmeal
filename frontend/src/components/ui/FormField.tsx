import { useId, type ReactNode } from 'react';

import { FieldError } from './FieldError';

interface FormFieldProps {
  label: string;
  error?: string;
  children: (id: string) => ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-green-600">
        {label}
      </label>
      {children(id)}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
