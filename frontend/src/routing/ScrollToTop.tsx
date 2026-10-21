import { useEffect } from 'react';
import { useLocation } from 'react-router';

/** Scrolls back to the top at every page change, as a classic website does. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return null;
}
