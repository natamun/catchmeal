import { lazy, Suspense, useState } from 'react';

import { useAuth } from './auth/auth-context';
import { AuthProvider } from './auth/AuthProvider';
import ChatBotPopup from './components/ai/ChatBotPopup';
import type { ActivityItem } from './components/friends/types';
import { ConnectionBanner } from './components/layout/ConnectionBanner';
import Nav, { type Tab } from './components/layout/Nav';
import { SocketProvider } from './socket/SocketProvider';
import type { ChatMessage } from './types/ChatBotType';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const FoodPage = lazy(() => import('./pages/FoodPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

type Page = 'landing' | 'login' | 'register';

function AppShell() {
  const { status, user } = useAuth();
  const [page, setPage] = useState<Page>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('error') === 'oauth_failed' ? 'login' : 'landing';
  });
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

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-green-500">
        Chargement...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    if (page === 'login' || page === 'register') {
      return (
        <Suspense fallback={null}>
          <AuthPage
            initialMode={page}
            onCancel={() => setPage('landing')}
            oauthError={oauthError}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={null}>
        <LandingPage
          onLogin={() => setPage('login')}
          onRegister={() => setPage('register')}
        />
      </Suspense>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const pages: Record<Tab, React.ReactNode> = {
    home: (
      <HomePage
        onNavigateToProfile={() => setActiveTab('profile')}
        onReplyToActivity={(activity) => {
          setPendingReply(activity);
          setActiveTab('friends');
        }}
      />
    ),
    food: <FoodPage />,
    stats: <StatsPage />,
    friends: <FriendsPage pendingReply={pendingReply} />,
    profile: <ProfilePage />,
    admin: isAdmin ? (
      <AdminPage />
    ) : (
      <HomePage onNavigateToProfile={() => setActiveTab('profile')} />
    ),
  };

  return (
    <div className="min-h-screen bg-green-50 md:pl-56">
      <ConnectionBanner />
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-6 pt-6 pb-24 md:pb-8"
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
      <Nav
        active={activeTab}
        onChange={(tab) => {
          setPendingReply(null);
          setActiveTab(tab);
        }}
        isAdmin={isAdmin}
      />
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
