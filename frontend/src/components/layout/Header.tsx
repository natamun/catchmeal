import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { LogOut, User } from 'lucide-react';

import { useAuth } from '../../auth/auth-context';
import { Avatar } from '../ui/Avatar';
import { DropdownPanel } from '../ui/DropdownPanel';

interface Props {
  username: string;
  avatarUrl?: string | null;
  onNavigateToProfile?: () => void;
}

export default function Header({
  username,
  avatarUrl,
  onNavigateToProfile,
}: Props) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null,
  );

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Bonjour {username}
        </h1>
        <p
          className="text-sm text-green-500 capitalize"
          aria-label={`Aujourd'hui : ${today}`}
        >
          {today}
        </p>
      </div>
      <div ref={setContainerNode}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
              aria-label="Menu utilisateur"
            >
              <Avatar username={username} avatarUrl={avatarUrl} size="sm" />
            </button>
          </Popover.Trigger>
          <DropdownPanel container={containerNode} align="end">
            <button
              type="button"
              onClick={() => {
                onNavigateToProfile?.();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-green-800 transition-colors hover:bg-green-50"
            >
              <User className="h-4 w-4 text-green-400" />
              Profil
            </button>
            <button
              type="button"
              onClick={() => {
                void logout();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-green-100 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </DropdownPanel>
        </Popover.Root>
      </div>
    </header>
  );
}
