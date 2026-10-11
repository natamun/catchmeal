import { useEffect, useRef, useState } from 'react';
import { Menu, X, type LucideIcon } from 'lucide-react';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';
import { Brand } from '../ui/Brand';

interface NavLink {
  label: string;
  onClick: () => void;
  current?: boolean;
}

interface Props {
  links: NavLink[];
  action: { label: string; icon: LucideIcon; onClick: () => void };
  onBrandClick: () => void;
}

export default function PublicHeader({ links, action, onBrandClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuVisible = useDelayedUnmount(menuOpen, 100);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const ActionIcon = action.icon;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const closeMenuThen = (callback: () => void) => () => {
    setMenuOpen(false);
    callback();
  };

  return (
    <header className="sticky top-0 z-10 h-header border-b border-green-200 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-8">
        <div className="flex md:flex-1">
          <button
            type="button"
            onClick={closeMenuThen(onBrandClick)}
            className="cursor-pointer"
          >
            <Brand />
          </button>
        </div>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-green-700">
            {links.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={link.onClick}
                  aria-current={link.current ? 'page' : undefined}
                  className="cursor-pointer transition-colors hover:text-green-500 aria-[current=page]:text-green-500"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-end gap-4 md:flex-1">
          <button
            type="button"
            onClick={action.onClick}
            aria-label={action.label}
            className="flex cursor-pointer text-sm font-medium text-green-700 transition-colors hover:text-green-500"
          >
            <ActionIcon className="h-6 w-6 md:hidden" />
            <span className="hidden md:inline">{action.label}</span>
          </button>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="public-menu"
            className="flex cursor-pointer text-green-700 md:hidden"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {menuVisible && (
        <nav
          id="public-menu"
          aria-label="Navigation principale"
          className={`absolute top-full right-0 left-0 border-y border-green-200 bg-white md:hidden ${menuOpen ? 'animate-fade-in-up' : 'animate-fade-out'}`}
        >
          <ul className="flex flex-col divide-y divide-green-200 text-sm font-medium text-green-700">
            {links.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={closeMenuThen(link.onClick)}
                  aria-current={link.current ? 'page' : undefined}
                  className="block w-full cursor-pointer px-8 py-3 text-left transition-colors hover:text-green-500 aria-[current=page]:text-green-500"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
