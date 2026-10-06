export type AdminSortField = 'name' | 'createdAt' | 'role';
export type AdminSortDirection = 'asc' | 'desc';

export interface AdminSortOption {
  field: AdminSortField;
  direction: AdminSortDirection;
}

export type AdminRoleFilter = 'all' | 'USER' | 'ADMIN';
export type AdminStatusFilter = 'all' | 'active' | 'deleted';
export type AdminOnlineFilter = 'all' | 'online' | 'offline';
export type AdminOAuthFilter = 'all' | 'local' | 'google' | 'github' | '42';

export interface AdminFilterCriteria {
  query: string;
  role: AdminRoleFilter;
  status: AdminStatusFilter;
  online: AdminOnlineFilter;
  oauth: AdminOAuthFilter;
  sort: AdminSortOption;
}

export const EMPTY_ADMIN_FILTER: AdminFilterCriteria = {
  query: '',
  role: 'all',
  status: 'all',
  online: 'all',
  oauth: 'all',
  sort: { field: 'name', direction: 'asc' },
};
