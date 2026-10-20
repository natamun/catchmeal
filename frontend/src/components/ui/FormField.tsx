import { useId, type ReactNode } from 'react';

import { FieldError } from './FieldError';
import { LABEL_CLASS } from './fieldStyle';

interface FormFieldProps {
  label: string;
  error?: string;
  children: (id: string) => ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  const id = useId();

  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {children(id)}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
