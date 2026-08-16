import { useState, lazy, Suspense } from 'react';
import Nav, { type Tab } from './components/layout/Nav';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

type Page = 'landing' | 'dashboard';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const pages: Record<Tab, React.ReactNode> = {
    home: <Dashboard />,
    scan: <ScanPage />,
    stats: <StatsPage />,
    friends: <FriendsPage />,
    profile: <ProfilePage />,
  };

  if (page === 'landing') {
    return (
      <Suspense fallback={null}>
        <LandingPage onLogin={() => setPage('dashboard')} onRegister={() => setPage('dashboard')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 md:pl-56">
      <main id="main-content" className="px-6 pt-6 pb-24 md:pb-8 max-w-6xl mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-40 text-green-500 text-sm">Chargement...</div>}>
          {pages[activeTab]}
        </Suspense>
      </main>
      <Nav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
