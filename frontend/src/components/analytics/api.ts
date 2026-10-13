import type { DashboardDay } from '../../types/dashboard-analytics';
import { request } from '../../utils/request';

const BASE_URL: string = import.meta.env.VITE_API_URL;

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
