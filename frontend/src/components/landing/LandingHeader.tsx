import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { LogIn, Menu, X } from 'lucide-react';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';
import Brand from './Brand';

interface Props {
  links: { label: string; href: string }[];
  onLogin: () => void;
}

export default function LandingHeader({ links, onLogin }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuVisible = useDelayedUnmount(menuOpen, 100);
  const burgerRef = useRef<HTMLButtonElement>(null);

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

  const scrollToTop = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setMenuOpen(false);
    document.querySelector(event.currentTarget.hash)?.scrollIntoView();
  };

  return (
    <header className="sticky top-0 z-10 h-(--header-height) border-b border-green-200 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-8">
        <div className="flex md:flex-1">
          <button
            type="button"
            onClick={scrollToTop}
            className="cursor-pointer"
          >
            <Brand />
          </button>
        </div>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-green-700">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={scrollToSection}
                  className="transition-colors hover:text-green-500"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center justify-end gap-4 md:flex-1">
          <button
            type="button"
            onClick={onLogin}
            aria-label="Connexion"
            className="flex cursor-pointer text-sm font-medium text-green-700 transition-colors hover:text-green-500"
          >
            <LogIn className="h-6 w-6 md:hidden" />
            <span className="hidden md:inline">Connexion</span>
          </button>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
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
          id="landing-menu"
          aria-label="Navigation principale"
          className={`absolute top-full right-0 left-0 border-y border-green-200 bg-white md:hidden ${menuOpen ? 'animate-fade-in-up' : 'animate-fade-out'}`}
        >
          <ul className="flex flex-col divide-y divide-green-200 text-sm font-medium text-green-700">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={scrollToSection}
                  className="block px-8 py-3 transition-colors hover:text-green-500"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
