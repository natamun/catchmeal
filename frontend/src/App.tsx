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
import { CheckEmailPage } from './pages/CheckEmailPage';
import { LandingPage } from './pages/LandingPage';
import { LegalNoticePage } from './pages/LegalNoticePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OAuthOnboardingPage } from './pages/OAuthOnboardingPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { RequireAdmin, RequireAuth, RequireGuest } from './routing/guards';
import type { NavigationState } from './routing/navigation';
import { PageTitle } from './routing/PageTitle';
import { PATHS } from './routing/paths';
import { ScrollToTop } from './routing/ScrollToTop';
import { SocketProvider } from './socket/SocketProvider';

/**
 * Remembers in localStorage that the last visit was logged in, so the journal
 * code can start downloading before /auth/me answers.
 */
const SESSION_HINT_KEY = 'session-hint';
const PRELOAD_DELAY_MS = 1000;

/**
 * The pages behind the login live in their own files and are loaded on demand
 * (lazy): visitors of the public pages never download them.
 */
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

/**
 * Starts downloading a page's code in advance. A failure is ignored: the page
 * will simply load when visited.
 */
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

/**
 * The '/' route: the landing page for visitors. A logged-in user goes to the
 * journal, or to the welcome page right after an OAuth sign-up. An OAuth error
 * sent back by the backend is shown on the login page.
 */
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

/**
 * Welcome page of a new OAuth user, who must choose a username first. "Back"
 * deletes the half-created account and logs out.
 */
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

/**
 * All the routes of the app. It waits for the session check before choosing a
 * page, so a logged-in user never sees the login page flash. Once logged in,
 * the code of the other pages is preloaded after one second.
 */
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
      <Route
        path={PATHS.checkEmail}
        element={
          <RequireGuest>
            <CheckEmailPage />
          </RequireGuest>
        }
      />
      <Route path={PATHS.legalNotice} element={<LegalNoticePage />} />
      <Route path={PATHS.privacy} element={<PrivacyPolicyPage />} />
      <Route path={PATHS.terms} element={<TermsOfServicePage />} />
      <Route path={PATHS.verifyEmail} element={<VerifyEmailPage />} />
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

/**
 * Root component: the router, then the tab title and scroll handling, then the
 * session and the socket around the routes.
 */
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
