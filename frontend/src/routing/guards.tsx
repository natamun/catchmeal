import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '../auth/auth-context';
import { PATHS } from '../routes';
import { navigationState, type NavigationState } from './navigation';

interface GuardProps {
  children: ReactNode;
}

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

export function RequireGuest({ children }: GuardProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    const { from } = navigationState(location);

    return <Navigate to={from ?? PATHS.home} replace />;
  }

  return children;
}

export function RequireAdmin({ children }: GuardProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={PATHS.home} replace />;
  }

  return children;
}
