import type { ReactNode } from 'react';
import { Navigate, useLocation, type Location } from 'react-router';

import { useAuth } from '../auth/auth-context';
import { PATHS } from '../routes';

interface GuardProps {
  children: ReactNode;
}

interface FromState {
  from?: Location;
}

export function RequireAuth({ children }: GuardProps) {
  const { status, loggedOut } = useAuth();
  const location = useLocation();

  if (status !== 'authenticated') {
    if (loggedOut) {
      return <Navigate to={PATHS.landing} replace />;
    }

    return <Navigate to={PATHS.login} replace state={{ from: location }} />;
  }

  return children;
}

export function RequireGuest({ children }: GuardProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    const from = (location.state as FromState | null)?.from;

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
