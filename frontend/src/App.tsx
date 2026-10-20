import { lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router';

import { useAuth } from './auth/authContext';
import { AuthProvider } from './auth/AuthProvider';
import { AppLayout } from './components/layout/AppLayout';
import { deleteMyAccount } from './components/profile/api';
import { useIosVisibleViewport } from './hooks/useIosVisibleViewport';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { LegalNoticePage } from './pages/LegalNoticePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OAuthOnboardingPage } from './pages/OAuthOnboardingPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { RequireAdmin, RequireAuth, RequireGuest } from './routing/guards';
import type { NavigationState } from './routing/navigation';
import { PageTitle } from './routing/PageTitle';
import { PATHS } from './routing/paths';
import { ScrollToTop } from './routing/ScrollToTop';
import { SocketProvider } from './socket/SocketProvider';

const SESSION_HINT_KEY = 'session-hint';
const PRELOAD_DELAY_MS = 1000;

const loaders = {
  home: () => import('./pages/HomePage'),
  journalAdd: () => import('./pages/JournalAddPage'),
  food: () => import('./pages/FoodPage'),
  stats: () => import('./pages/StatsPage'),
  friends: () => import('./pages/FriendsPage'),
  profile: () => import('./pages/ProfilePage'),
  admin: () => import('./pages/AdminPage'),
};

const HomePage = lazy(loaders.home);
const JournalAddPage = lazy(loaders.journalAdd);
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

function LandingRoute() {
  const { status } = useAuth();
  const [params] = useSearchParams();

  if (params.get('error') === 'oauth_failed') {
    const state: NavigationState = { oauthFailed: true };

    return <Navigate to={PATHS.login} replace state={state} />;
  }

  if (status === 'authenticated') {
    return (
      <Navigate
        to={params.get('onboarding') === '1' ? PATHS.welcome : PATHS.home}
        replace
      />
    );
  }

  return <LandingPage />;
}

function WelcomeRoute() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <OAuthOnboardingPage
      prefill={{
        username: '',
        name: user.name ?? '',
        email: user.email ?? '',
      }}
      onComplete={() => void navigate(PATHS.home, { replace: true })}
      onBack={async () => {
        await deleteMyAccount().catch(() => undefined);
        await logout();
      }}
    />
  );
}

function AppRoutes() {
  const { status, user } = useAuth();
  const role = user?.role;

  useIosVisibleViewport();

  useEffect(() => {
    if (status === 'loading') return;
    saveSessionHint(status === 'authenticated');
    if (status !== 'authenticated') return;

    const timer = window.setTimeout(() => {
      preload(loaders.journalAdd);
      preload(loaders.food);
      preload(loaders.stats);
      preload(loaders.friends);
      preload(loaders.profile);
      if (role === 'ADMIN') preload(loaders.admin);
    }, PRELOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [status, role]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-green-500">
        Chargement...
      </div>
    );
  }

  return (
    <Routes>
      <Route path={PATHS.landing} element={<LandingRoute />} />
      <Route
        path={PATHS.login}
        element={
          <RequireGuest>
            <AuthPage />
          </RequireGuest>
        }
      />
      <Route
        path={PATHS.register}
        element={
          <RequireGuest>
            <AuthPage />
          </RequireGuest>
        }
      />
      <Route path={PATHS.legalNotice} element={<LegalNoticePage />} />
      <Route path={PATHS.privacy} element={<PrivacyPolicyPage />} />
      <Route path={PATHS.terms} element={<TermsOfServicePage />} />
      <Route
        path={PATHS.welcome}
        element={
          <RequireAuth>
            <WelcomeRoute />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.journalAdd} element={<JournalAddPage />} />
        <Route path={PATHS.food} element={<FoodPage />} />
        <Route path={PATHS.stats} element={<StatsPage />} />
        <Route path={PATHS.friends} element={<FriendsPage />} />
        <Route path={PATHS.profile} element={<ProfilePage />} />
        <Route
          path={PATHS.admin}
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTitle />
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
