import { request } from '../../utils/request';
import type { DashboardDay } from './types';

const BASE_URL: string = import.meta.env.VITE_API_URL;

/**
 * GET /users/:id/dashboard?from=&to=: one entry per day (calories, macros,
 * weigh-in, goal) for the stats page.
 */
export function getDashboard(
  userId: number,
  from: string,
  to: string,
  signal?: AbortSignal,
) {
  return request<DashboardDay[]>(
    `${BASE_URL}/users/${userId}/dashboard?from=${from}&to=${to}`,
    { signal },
  );
}
