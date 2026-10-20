import { Suspense, useState } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router';

import { useCurrentUser } from '../../auth/authContext';
import { PATHS } from '../../routing/paths';
import { ChatBotPopup } from '../ai/ChatBotPopup';
import type { ChatMessage } from '../ai/types';
import { ToastProvider } from '../ui/ToastProvider';
import { ConnectionBanner } from './ConnectionBanner';
import { Nav, type Tab } from './Nav';

const TABS: Tab[] = ['home', 'food', 'stats', 'friends', 'profile', 'admin'];

const ASSISTANT_TABS: Tab[] = ['home', 'stats', 'food'];

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Bonjour ! Je peux vous aider à comprendre vos stats ou vous conseiller sur vos repas 😊',
};

function tabFromPath(pathname: string): Tab {
  return (
    TABS.find(
      (tab) => pathname === PATHS[tab] || pathname.startsWith(`${PATHS[tab]}/`),
    ) ?? 'home'
  );
}

export function AppLayout() {
  const user = useCurrentUser();
  const { pathname } = useLocation();
  const isAddingToJournal = useMatch(PATHS.journalAdd) !== null;
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const activeTab = tabFromPath(pathname);
  const hasAssistant = ASSISTANT_TABS.includes(activeTab);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-green-50">
        <ConnectionBanner />
        <Nav isAdmin={user.role === 'ADMIN'} />
        <main
          id="main-content"
          className={`mx-auto max-w-6xl px-6 pt-6 ${
            hasAssistant
              ? 'pb-24 pointer-coarse:pb-[calc(var(--spacing-bottom-nav)+6rem+env(safe-area-inset-bottom))]'
              : 'pb-8 pointer-coarse:pb-[calc(var(--spacing-bottom-nav)+2rem+env(safe-area-inset-bottom))]'
          }`}
        >
          <Suspense
            fallback={
              <div className="flex h-40 items-center justify-center text-sm text-green-500">
                Chargement...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        {hasAssistant && !isAddingToJournal && (
          <ChatBotPopup
            isOpen={isAssistantOpen}
            onToggle={setIsAssistantOpen}
            messages={assistantMessages}
            onMessagesChange={setAssistantMessages}
            activePage={activeTab}
          />
        )}
      </div>
    </ToastProvider>
  );
}
