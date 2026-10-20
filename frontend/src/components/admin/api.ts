import { JSON_HEADERS, request } from '../../utils/request';

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * A user as the admin board sees it: login method, online status and friend
 * count included.
 */
export interface AdminUser {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  createAt: string;
  deletedAt: string | null;
  lastSeenAt: string | null;
  hasPassword: boolean;
  oauthProvider?: string | null;
  onlineStatus: boolean;
  _count?: { userFriend: number };
}

export interface AdminStats {
  totalUsers: number;
  totalMeals: number;
  totalFoodItems: number;
}

/**
 * GET /admin/users/:id: one user's details, reloaded when the admin opens them.
 */
export function getUserById(id: number) {
  return request<AdminUser | null>(`${BASE_URL}/admin/users/${id}`);
}

/** GET /admin/users: every account, deleted ones included. */
export function getUsers() {
  return request<AdminUser[]>(`${BASE_URL}/admin/users`);
}

/** GET /admin/stats: the totals shown at the top of the admin page. */
export function getStats() {
  return request<AdminStats>(`${BASE_URL}/admin/stats`);
}

export interface AdminUserChanges {
  role?: AdminUser['role'];
  username?: string;
}

/**
 * PATCH /admin/users/:id: changes the role and/or the username; the backend
 * answers 409 when the username is taken.
 */
export function updateUser(id: number, changes: AdminUserChanges) {
  return request<Pick<AdminUser, 'id' | 'username' | 'role'>>(
    `${BASE_URL}/admin/users/${id}`,
    {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(changes),
    },
  );
}

/**
 * DELETE /admin/users/:id: soft delete, the account is only marked as deleted.
 */
export function deleteUser(id: number) {
  return request<AdminUser>(`${BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
  });
}
