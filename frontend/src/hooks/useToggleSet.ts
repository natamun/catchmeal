import { useState } from 'react';

export function useToggleSet<T>() {
  const [values, setValues] = useState<Set<T>>(() => new Set());

  const toggle = (value: T) => {
    setValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  return [values, toggle] as const;
}
