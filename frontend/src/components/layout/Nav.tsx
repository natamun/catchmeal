import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Apple,
  ChartColumn,
  House,
  LogOut,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { Avatar } from '../ui/Avatar';
import { Brand } from '../ui/Brand';
import { DropdownPanel } from '../ui/DropdownPanel';

export type Tab = 'home' | 'food' | 'stats' | 'friends' | 'profile' | 'admin';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  isAdmin?: boolean;
}

interface TabDef {
  id: Tab;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

interface NavButtonProps {
  tab: TabDef;
  isActive: boolean;
  variant: 'top' | 'bottom';
  onClick: () => void;
  icon?: ReactNode;
}

const MAIN_TABS: TabDef[] = [
  { id: 'home', label: 'Accueil', icon: House },
  { id: 'food', label: 'Alimentation', shortLabel: 'Aliments', icon: Apple },
  {
    id: 'stats',
    label: 'Statistiques',
    shortLabel: 'Stats',
    icon: ChartColumn,
  },
  { id: 'friends', label: 'Amis', icon: Users },
];

const PROFILE_TAB: TabDef = { id: 'profile', label: 'Profil', icon: User };

const ADMIN_TAB: TabDef = { id: 'admin', label: 'Admin', icon: ShieldCheck };

const MENU_ITEM_CLASS =
  'flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors';

function NavButton({ tab, isActive, variant, onClick, icon }: NavButtonProps) {
  const Icon = tab.icon;
  const baseClass =
    'cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2';

  if (variant === 'top') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        aria-label={tab.label}
        title={tab.label}
        className={`${baseClass} flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
          isActive
            ? 'animate-pill-select bg-green-100 text-green-800'
            : 'text-green-700 hover:bg-green-100'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="hidden md:inline">{tab.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={tab.label}
      className={`${baseClass} w-full px-1 py-1.5 text-xs font-medium ${
        isActive ? 'text-green-800' : 'text-green-600'
      }`}
    >
      <span
        className={`flex flex-col items-center gap-1 rounded-xl py-1.5 ${isActive ? 'animate-pill-select bg-green-100' : ''}`}
      >
        {icon ?? <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
        {tab.shortLabel ?? tab.label}
      </span>
    </button>
  );
}

export default function Nav({ active, onChange, isAdmin = false }: Props) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuContainer, setMenuContainer] = useState<HTMLDivElement | null>(
    null,
  );

  if (!user) {
    return null;
  }

  const bottomTabs = isAdmin
    ? [...MAIN_TABS, ADMIN_TAB, PROFILE_TAB]
    : [...MAIN_TABS, PROFILE_TAB];

  const openFromMenu = (tab: Tab) => {
    setMenuOpen(false);
    onChange(tab);
  };

  return (
    <>
      <header className="sticky top-0 z-10 h-header border-b border-green-200 bg-white/75 backdrop-blur-md pointer-coarse:hidden">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex">
            <Brand />
          </div>
          <nav aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {MAIN_TABS.map((tab) => (
                <li key={tab.id}>
                  <NavButton
                    tab={tab}
                    isActive={tab.id === active}
                    variant="top"
                    onClick={() => onChange(tab.id)}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div ref={setMenuContainer} className="flex">
            <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  aria-label="Menu du compte"
                  className={`cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 ${
                    active === 'profile' || active === 'admin'
                      ? 'ring-2 ring-green-500 ring-offset-2'
                      : ''
                  }`}
                >
                  <Avatar
                    username={user.username}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                  />
                </button>
              </Popover.Trigger>
              <DropdownPanel container={menuContainer} align="end">
                <button
                  type="button"
                  onClick={() => openFromMenu('profile')}
                  className={`${MENU_ITEM_CLASS} text-green-800 hover:bg-green-50`}
                >
                  <User className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Profil
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => openFromMenu('admin')}
                    className={`${MENU_ITEM_CLASS} text-green-800 hover:bg-green-50`}
                  >
                    <ShieldCheck
                      className="h-4 w-4 text-green-500"
                      aria-hidden="true"
                    />
                    Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className={`${MENU_ITEM_CLASS} border-t border-green-100 whitespace-nowrap text-red-500 hover:bg-red-50`}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Se déconnecter
                </button>
              </DropdownPanel>
            </Popover.Root>
          </div>
        </div>
      </header>

      <footer className="fixed right-0 bottom-0 left-0 z-10 hidden border-t border-green-200 bg-white pr-[max(0.5rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(0.5rem,env(safe-area-inset-left))] pointer-coarse:block">
        <nav aria-label="Navigation principale">
          <ul className="flex">
            {bottomTabs.map((tab) => (
              <li key={tab.id} className="flex-1">
                <NavButton
                  tab={tab}
                  isActive={tab.id === active}
                  variant="bottom"
                  onClick={() => onChange(tab.id)}
                  icon={
                    tab.id === 'profile' ? (
                      <span aria-hidden="true">
                        <Avatar
                          username={user.username}
                          avatarUrl={user.avatarUrl}
                          size="xs"
                        />
                      </span>
                    ) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </>
  );
}
