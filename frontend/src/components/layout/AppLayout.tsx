import { Suspense, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../../auth/auth-context';
import { PATHS } from '../../routes';
import type { ChatMessage } from '../../types/ChatBotType';
import ChatBotPopup from '../ai/ChatBotPopup';
import type { ActivityItem } from '../friends/types';
import { ConnectionBanner } from './ConnectionBanner';
import Nav, { type Tab } from './Nav';

const TABS: Tab[] = ['home', 'food', 'stats', 'friends', 'profile', 'admin'];

const ASSISTANT_TABS: Tab[] = ['home', 'stats', 'food'];

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Salut ! Je peux t'aider à comprendre tes stats ou te conseiller sur tes repas 😊",
};

export interface AppLayoutContext {
  pendingReply: ActivityItem | null;
  setPendingReply: (activity: ActivityItem | null) => void;
  setIsJournalPickerOpen: (isOpen: boolean) => void;
}

function tabFromPath(pathname: string): Tab {
  return (
    TABS.find(
      (tab) => pathname === PATHS[tab] || pathname.startsWith(`${PATHS[tab]}/`),
    ) ?? 'home'
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pendingReply, setPendingReply] = useState<ActivityItem | null>(null);
  const [isJournalPickerOpen, setIsJournalPickerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const activeTab = tabFromPath(pathname);
  const hasAssistant = ASSISTANT_TABS.includes(activeTab);
  const context: AppLayoutContext = {
    pendingReply,
    setPendingReply,
    setIsJournalPickerOpen,
  };

  return (
    <div className="min-h-screen bg-green-50">
      <ConnectionBanner />
      <Nav
        active={activeTab}
        onChange={(tab) => {
          setPendingReply(null);
          void navigate(PATHS[tab]);
        }}
        isAdmin={user?.role === 'ADMIN'}
      />
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
          <Outlet context={context} />
        </Suspense>
      </main>
      {hasAssistant && !isJournalPickerOpen && (
        <ChatBotPopup
          isOpen={isAssistantOpen}
          onToggle={setIsAssistantOpen}
          messages={assistantMessages}
          onMessagesChange={setAssistantMessages}
          activePage={activeTab}
        />
      )}
    </div>
  );
}
