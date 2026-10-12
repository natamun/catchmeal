type AdminSortField = 'name' | 'createdAt' | 'role';
type AdminSortDirection = 'asc' | 'desc';

export interface AdminSortOption {
  field: AdminSortField;
  direction: AdminSortDirection;
}

type AdminRoleFilter = 'all' | 'USER' | 'ADMIN';
type AdminStatusFilter = 'all' | 'active' | 'deleted';
type AdminOnlineFilter = 'all' | 'online' | 'offline';
type AdminOAuthFilter = 'all' | 'local' | 'google' | 'github' | '42';

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
