import type { DashboardDay } from '../../types/dashboard-analytics';

const BASE_URL: string = import.meta.env.VITE_API_URL;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

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
