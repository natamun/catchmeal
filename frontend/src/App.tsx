import { lazy, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router';

import { useAuth } from './auth/auth-context';
import { AuthProvider } from './auth/AuthProvider';
import AppLayout, {
  type AppLayoutContext,
} from './components/layout/AppLayout';
import type { LegalPageId } from './components/legal/LegalLayout';
import { deleteMyAccount } from './components/profile/api';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import LegalNoticePage from './pages/LegalNoticePage';
import NotFoundPage from './pages/NotFoundPage';
import OAuthOnboardingPage from './pages/OAuthOnboardingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { PATHS } from './routes';
import { RequireAdmin, RequireAuth, RequireGuest } from './routing/guards';
import { SocketProvider } from './socket/SocketProvider';

const SESSION_HINT_KEY = 'session-hint';
const PRELOAD_DELAY_MS = 1000;
const OAUTH_ERROR_MESSAGE = 'La connexion a échoué. Réessayez.';

const LEGAL_PATHS: Record<LegalPageId, string> = {
  'mentions-legales': PATHS.legalNotice,
  confidentialite: PATHS.privacy,
  conditions: PATHS.terms,
};

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

function LandingRoute() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  if (params.get('error') === 'oauth_failed') {
    return <Navigate to={PATHS.login} replace state={{ oauthFailed: true }} />;
  }

  if (status === 'authenticated') {
    return (
      <Navigate
        to={params.get('onboarding') === '1' ? PATHS.welcome : PATHS.home}
        replace
      />
    );
  }

  return (
    <LandingPage
      onLogin={() => void navigate(PATHS.login)}
      onRegister={() => void navigate(PATHS.register)}
      onMentionsLegales={() => void navigate(PATHS.legalNotice)}
      onConfidentialite={() => void navigate(PATHS.privacy)}
      onConditions={() => void navigate(PATHS.terms)}
    />
  );
}

function AuthRoute({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const oauthFailed =
    (location.state as { oauthFailed?: boolean } | null)?.oauthFailed === true;

  return (
    <RequireGuest>
      <AuthPage
        key={mode}
        initialMode={mode}
        onCancel={() => void navigate(PATHS.landing)}
        oauthError={oauthFailed ? OAUTH_ERROR_MESSAGE : null}
      />
    </RequireGuest>
  );
}

function LegalRoute({ page }: { page: LegalPageId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const props = {
    onBack: () =>
      void (location.key === 'default'
        ? navigate(PATHS.landing)
        : navigate(-1)),
    onNavigate: (target: LegalPageId) => void navigate(LEGAL_PATHS[target]),
  };

  if (page === 'mentions-legales') {
    return <LegalNoticePage {...props} />;
  }
  if (page === 'confidentialite') {
    return <PrivacyPolicyPage {...props} />;
  }
  return <TermsOfServicePage {...props} />;
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

function HomeRoute() {
  const navigate = useNavigate();
  const { setPendingReply, setIsJournalPickerOpen } =
    useOutletContext<AppLayoutContext>();

  return (
    <HomePage
      onReplyToActivity={(activity) => {
        setPendingReply(activity);
        void navigate(PATHS.friends);
      }}
      onPickerChange={setIsJournalPickerOpen}
    />
  );
}

function FriendsRoute() {
  const { pendingReply } = useOutletContext<AppLayoutContext>();

  return <FriendsPage pendingReply={pendingReply} />;
}

function ProfileRoute() {
  const navigate = useNavigate();

  return (
    <ProfilePage
      onPolitiqueConfidentialite={() => void navigate(PATHS.privacy)}
    />
  );
}

function AppRoutes() {
  const { status, user } = useAuth();
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
      <Route path={PATHS.login} element={<AuthRoute mode="login" />} />
      <Route path={PATHS.register} element={<AuthRoute mode="register" />} />
      <Route
        path={PATHS.legalNotice}
        element={<LegalRoute page="mentions-legales" />}
      />
      <Route
        path={PATHS.privacy}
        element={<LegalRoute page="confidentialite" />}
      />
      <Route path={PATHS.terms} element={<LegalRoute page="conditions" />} />
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
        <Route path={PATHS.home} element={<HomeRoute />} />
        <Route path={PATHS.food} element={<FoodPage />} />
        <Route path={PATHS.stats} element={<StatsPage />} />
        <Route path={PATHS.friends} element={<FriendsRoute />} />
        <Route path={PATHS.profile} element={<ProfileRoute />} />
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
