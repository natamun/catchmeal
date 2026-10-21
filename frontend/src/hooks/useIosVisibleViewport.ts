import { useEffect } from 'react';

/**
 * iPhone only. Safari does not shrink the page when the keyboard opens, the
 * keyboard covers it. This hook copies the area still visible
 * (window.visualViewport) into the CSS variables --visible-top and
 * --visible-height, which the `ios-typing:` classes use to keep dialogs and the
 * chat above the keyboard.
 */
export function useIosVisibleViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const isIosSafari = CSS.supports('-webkit-touch-callout', 'none');
    if (!viewport || !isIosSafari) {
      return;
    }

    const root = document.documentElement;
    const update = () => {
      root.style.setProperty('--visible-top', `${viewport.offsetTop}px`);
      root.style.setProperty('--visible-height', `${viewport.height}px`);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);

    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.style.removeProperty('--visible-top');
      root.style.removeProperty('--visible-height');
    };
  }, []);
}
