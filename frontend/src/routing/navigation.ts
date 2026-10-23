import { useLocation, useNavigate, type Location } from 'react-router';

import type { ActivityItem } from '../components/friends/types';

export type OAuthError = 'failed' | 'unverified-email';

/**
 * Data passed from one page to the next through the router's location.state.
 */
export interface NavigationState {
  /**
   * The protected page the user asked for, to go back to it after logging in.
   */
  from?: Location;
  /** Set when the backend sends the browser back after a failed OAuth sign-in. */
  oauthError?: OAuthError;
  /** The activity to quote when a reply starts from the home page feed. */
  replyTo?: ActivityItem;
  /** Address a confirmation link was sent to */
  email?: string;
}

/** Reads location.state with a safe default: it is untyped and often empty. */
export function navigationState(location: Location): NavigationState {
  return (location.state as NavigationState | null) ?? {};
}

/**
 * Goes back to the previous page, or to `fallback` when the page was opened
 * directly and there is no previous page in the app.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return () =>
    void (location.key === 'default'
      ? navigate(fallback, { replace: true })
      : navigate(-1));
}
