import { lazy, Suspense, useState } from 'react';

import { useAuth } from './auth/auth-context';
import { AuthProvider } from './auth/AuthProvider';
import Nav, { type Tab } from './components/layout/Nav';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const FoodPage = lazy(() => import('./pages/FoodPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

type Page = 'landing' | 'login' | 'register';

function AppShell() {
  const { status } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('home');

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
          <AuthPage initialMode={page} onCancel={() => setPage('landing')} />
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

  const pages: Record<Tab, React.ReactNode> = {
    home: <HomePage />,
    food: <FoodPage />,
    stats: <StatsPage />,
    friends: <FriendsPage />,
    profile: <ProfilePage />,
  };

  /*if (page === 'landing') {
    return (
      <Suspense fallback={null}>
        <LandingPage
          onLogin={() => setPage('dashboard')}
          onRegister={() => setPage('dashboard')}
        />
      </Suspense>
    );
  }*/

  return (
    <div className="min-h-screen bg-green-50 md:pl-56">
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
      <Nav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
