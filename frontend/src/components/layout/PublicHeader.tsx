import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X, type LucideIcon } from 'lucide-react';
import { Link, NavLink } from 'react-router';

import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';
import { PATHS } from '../../routing/paths';
import { Brand } from '../ui/Brand';

type Target = { to: string } | { onClick: () => void };

type HeaderLink = Target & { label: string };

type HeaderAction = Target & { label: string; icon: LucideIcon };

interface Props {
  links: HeaderLink[];
  action: HeaderAction;
}

interface PressableProps {
  target: Target;
  className: string;
  ariaLabel?: string;
  onPress?: () => void;
  children: ReactNode;
}

function Pressable({
  target,
  className,
  ariaLabel,
  onPress,
  children,
}: PressableProps) {
  if ('to' in target) {
    return (
      <NavLink
        to={target.to}
        aria-label={ariaLabel}
        onClick={onPress}
        className={className}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        onPress?.();
        target.onClick();
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

export default function PublicHeader({ links, action }: Props) {
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-10 h-header border-b border-green-200 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-8">
        <div className="flex">
          <Link
            to={PATHS.landing}
            onClick={() => {
              closeMenu();
              window.scrollTo({ top: 0 });
            }}
          >
            <Brand />
          </Link>
        </div>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-green-700">
            {links.map((link) => (
              <li key={link.label}>
                <Pressable
                  target={link}
                  className="transition-colors hover:text-green-500 aria-[current=page]:text-green-500"
                >
                  {link.label}
                </Pressable>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <Pressable
            target={action}
            ariaLabel={action.label}
            className="flex text-sm font-medium text-green-700 transition-colors hover:text-green-500"
          >
            <ActionIcon className="h-6 w-6 md:hidden" />
            <span className="hidden md:inline">{action.label}</span>
          </Pressable>
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
                <Pressable
                  target={link}
                  onPress={closeMenu}
                  className="block w-full px-8 py-3 text-left transition-colors hover:text-green-500 aria-[current=page]:text-green-500"
                >
                  {link.label}
                </Pressable>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
