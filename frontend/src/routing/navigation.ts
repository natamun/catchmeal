import { useLocation, useNavigate, type Location } from 'react-router';

import type { ActivityItem } from '../components/friends/types';

export interface NavigationState {
  from?: Location;
  oauthFailed?: boolean;
  replyTo?: ActivityItem;
}

export function navigationState(location: Location): NavigationState {
  return (location.state as NavigationState | null) ?? {};
}

export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return () =>
    void (location.key === 'default'
      ? navigate(fallback, { replace: true })
      : navigate(-1));
}
