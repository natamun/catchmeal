import { useEffect, useState } from 'react';

/**
 * True when the main pointer can hover (a mouse), false on touch screens.
 * Follows changes, e.g. a mouse plugged into a tablet.
 */
export function useSupportsHover() {
  const [supportsHover, setSupportsHover] = useState(
    () => window.matchMedia('(hover: hover)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(hover: hover)');
    const handleChange = () => setSupportsHover(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return supportsHover;
}
