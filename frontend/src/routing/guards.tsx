import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../auth/authContext';
import { navigationState, type NavigationState } from './navigation';
import { PATHS } from './paths';

interface GuardProps {
  children: ReactNode;
}

/**
 * Shows its children only to a logged-in user. Otherwise it redirects: to the
 * landing page right after a logout, else to /login while remembering the page
 * that was asked for.
 */
export function RequireAuth({ children }: GuardProps) {
  const { status, loggedOut } = useAuth();
  const location = useLocation();

  if (status !== 'authenticated') {
    if (loggedOut) {
      return <Navigate to={PATHS.landing} replace />;
    }

    const state: NavigationState = { from: location };

    return <Navigate to={PATHS.login} replace state={state} />;
  }

  return children;
}

/**
 * For the login and register pages: a logged-in user is sent to the page they
 * were heading to, or to the journal.
 */
export function RequireGuest({ children }: GuardProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    const { from } = navigationState(location);

    return <Navigate to={from ?? PATHS.home} replace />;
  }

  return children;
}

/** For the admin page: anyone who is not an admin is sent to the journal. */
export function RequireAdmin({ children }: GuardProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={PATHS.home} replace />;
  }

  return children;
}
