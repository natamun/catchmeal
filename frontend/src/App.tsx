import { lazy, Suspense, useEffect, useState } from 'react';

import { useAuth } from './auth/auth-context';
import { AuthProvider } from './auth/AuthProvider';
import ChatBotPopup from './components/ai/ChatBotPopup';
import type { ActivityItem } from './components/friends/types';
import { ConnectionBanner } from './components/layout/ConnectionBanner';
import Nav, { type Tab } from './components/layout/Nav';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import LegalNoticePage from './pages/LegalNoticePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { SocketProvider } from './socket/SocketProvider';
import type { ChatMessage } from './types/ChatBotType';

const SESSION_HINT_KEY = 'session-hint';
const PRELOAD_DELAY_MS = 1000;

const loaders = {
  home: () => import('./pages/HomePage'),
  food: () => import('./pages/FoodPage'),
  stats: () => import('./pages/StatsPage'),
  friends: () => import('./pages/FriendsPage'),
  profile: () => import('./pages/ProfilePage'),
  admin: () => import('./pages/AdminPage'),
};

const HomePage = lazy(loaders.home);
const FoodPage = lazy(loaders.food);
const StatsPage = lazy(loaders.stats);
const FriendsPage = lazy(loaders.friends);
const ProfilePage = lazy(loaders.profile);
const AdminPage = lazy(loaders.admin);

function preload(load: () => Promise<unknown>) {
  load().catch(() => undefined);
}

function hasSessionHint() {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) !== null;
  } catch {
    return false;
  }
}

function saveSessionHint(connected: boolean) {
  try {
    if (connected) localStorage.setItem(SESSION_HINT_KEY, '1');
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    return;
  }
}

if (hasSessionHint()) preload(loaders.home);

type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'mentions-legales'
  | 'confidentialite'
  | 'conditions';

function AppShell() {
  const { status, user } = useAuth();
  const [page, setPage] = useState<Page>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('error') === 'oauth_failed' ? 'login' : 'landing';
  });
  const [previousPage, setPreviousPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pendingReply, setPendingReply] = useState<ActivityItem | null>(null);
  const [oauthError] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'oauth_failed') {
      window.history.replaceState({}, '', window.location.pathname);
      return 'La connexion a échoué. Réessaye.';
    }
    return null;
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Salut ! Je peux t'aider à comprendre tes stats ou te conseiller sur tes repas 😊",
    },
  ]);

  const role = user?.role;

  useEffect(() => {
    if (status === 'loading') return;
    saveSessionHint(status === 'authenticated');
    if (status !== 'authenticated') return;

    const timer = window.setTimeout(() => {
      preload(loaders.food);
      preload(loaders.stats);
      preload(loaders.friends);
      preload(loaders.profile);
      if (role === 'ADMIN') preload(loaders.admin);
    }, PRELOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [status, role]);

  const navigateTo = (dest: Page) => {
    setPreviousPage(page);
    setPage(dest);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-green-500">
        Chargement...
      </div>
    );
  }

  if (page === 'mentions-legales') {
    return (
      <LegalNoticePage
        onBack={() => setPage(previousPage)}
        onNavigate={setPage}
      />
    );
  }

  if (page === 'confidentialite') {
    return (
      <PrivacyPolicyPage
        onBack={() => setPage(previousPage)}
        onNavigate={setPage}
      />
    );
  }

  if (page === 'conditions') {
    return (
      <TermsOfServicePage
        onBack={() => setPage(previousPage)}
        onNavigate={setPage}
      />
    );
  }

  if (status === 'unauthenticated') {
    if (page === 'login' || page === 'register') {
      return (
        <AuthPage
          initialMode={page}
          onCancel={() => setPage('landing')}
          oauthError={oauthError}
        />
      );
    }

    return (
      <LandingPage
        onLogin={() => navigateTo('login')}
        onRegister={() => navigateTo('register')}
        onMentionsLegales={() => navigateTo('mentions-legales')}
        onConfidentialite={() => navigateTo('confidentialite')}
        onConditions={() => navigateTo('conditions')}
      />
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const pages: Record<Tab, React.ReactNode> = {
    home: (
      <HomePage
        onReplyToActivity={(activity) => {
          setPendingReply(activity);
          setActiveTab('friends');
        }}
      />
    ),
    food: <FoodPage />,
    stats: <StatsPage />,
    friends: <FriendsPage pendingReply={pendingReply} />,
    profile: (
      <ProfilePage
        onPolitiqueConfidentialite={() => navigateTo('confidentialite')}
      />
    ),
    admin: isAdmin ? <AdminPage /> : <HomePage />,
  };

  return (
    <div className="min-h-screen bg-green-50">
      <ConnectionBanner />
      <Nav
        active={activeTab}
        onChange={(tab) => {
          setPendingReply(null);
          setActiveTab(tab);
        }}
        isAdmin={isAdmin}
      />
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-6 pt-6 pb-8 pointer-coarse:pb-[calc(6rem+env(safe-area-inset-bottom))]"
      >
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center text-sm text-green-500">
              Chargement...
            </div>
          }
        >
          {pages[activeTab]}
        </Suspense>
      </main>
      {(activeTab === 'stats' ||
        activeTab === 'home' ||
        activeTab === 'food') && (
        <ChatBotPopup
          isOpen={isOpen}
          onToggle={setIsOpen}
          messages={message}
          onMessagesChange={setMessage}
          activePage={activeTab}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppShell />
      </SocketProvider>
    </AuthProvider>
  );
}
