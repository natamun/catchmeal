import { useState } from 'react';

/**
 * A Set kept in state, with a function that adds or removes a value. Used for
 * the rows a list shows expanded.
 */
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
