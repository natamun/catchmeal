import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import AdminSearchBar from '../components/admin/AdminSearchBar';
import { AdminUserDialog } from '../components/admin/AdminUserDialog';
import {
  getStats,
  getUserById,
  getUsers,
  type AdminStats,
  type AdminUser,
} from '../components/admin/api';
import {
  EMPTY_ADMIN_FILTER,
  type AdminFilterCriteria,
} from '../components/admin/types';
import { Avatar } from '../components/ui/Avatar';
import { EditIconButton } from '../components/ui/EditIconButton';
import {
  ListCard,
  ListCardEmpty,
  ListCardLoading,
} from '../components/ui/ListCard';
import { LoadError } from '../components/ui/LoadError';
import Skeleton from '../components/ui/Skeleton';
import StatTile from '../components/ui/StatTile';
import SummaryCard from '../components/ui/SummaryCard';

function matches(user: AdminUser, criteria: AdminFilterCriteria) {
  const query = criteria.query.trim().toLowerCase();
  const matchesQuery =
    !query ||
    user.username.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query);
  const matchesRole = criteria.role === 'all' || user.role === criteria.role;
  const matchesStatus =
    criteria.status === 'all' ||
    (criteria.status === 'active' && !user.deletedAt) ||
    (criteria.status === 'deleted' && Boolean(user.deletedAt));
  const matchesOnline =
    criteria.online === 'all' ||
    (criteria.online === 'online' && user.onlineStatus) ||
    (criteria.online === 'offline' && !user.onlineStatus);
  const matchesOAuth =
    criteria.oauth === 'all' ||
    (criteria.oauth === 'local' && !user.oauthProvider) ||
    user.oauthProvider === criteria.oauth;

  return (
    matchesQuery &&
    matchesRole &&
    matchesStatus &&
    matchesOnline &&
    matchesOAuth
  );
}

function compare(a: AdminUser, b: AdminUser, criteria: AdminFilterCriteria) {
  const { field, direction } = criteria.sort;
  const order = direction === 'asc' ? 1 : -1;

  if (field === 'name') {
    return a.username.localeCompare(b.username) * order;
  }
  if (field === 'role') {
    return a.role.localeCompare(b.role) * order;
  }
  return a.createAt.localeCompare(b.createAt) * order;
}

export default function AdminPage() {
  const {
    user: currentUser,
    logout,
    updateUser: updateCurrentUser,
  } = useAuth();
  const [criteria, setCriteria] =
    useState<AdminFilterCriteria>(EMPTY_ADMIN_FILTER);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [hasError, setHasError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [dialog, setDialog] = useState<{
    userId: number | null;
    openCount: number;
  }>({ userId: null, openCount: 0 });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([getUsers(), getStats()])
      .then(([list, totals]) => {
        if (isCurrent) {
          setUsers(list);
          setStats(totals);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHasError(true);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const retry = () => {
    setHasError(false);
    setAttempt((count) => count + 1);
  };

  const mergeUser = (userId: number, changes: Partial<AdminUser>) => {
    setUsers(
      (previous) =>
        previous?.map((user) =>
          user.id === userId ? { ...user, ...changes } : user,
        ) ?? null,
    );
  };

  const openUser = (user: AdminUser) => {
    setDialog(({ openCount }) => ({
      userId: user.id,
      openCount: openCount + 1,
    }));
    dialogRef.current?.showModal();
    void getUserById(user.id)
      .then((fresh) => fresh && mergeUser(fresh.id, fresh))
      .catch(() => undefined);
  };

  const isLoading = users === null && !hasError;
  const selected = users?.find((user) => user.id === dialog.userId) ?? null;
  const visible = (users ?? [])
    .filter((user) => matches(user, criteria))
    .sort((a, b) => compare(a, b, criteria));
  const tiles = [
    { label: 'Utilisateurs', value: stats?.totalUsers },
    {
      label: 'En ligne',
      value: users?.filter((user) => user.onlineStatus).length,
    },
    { label: 'Repas', value: stats?.totalMeals },
    { label: 'Aliments', value: stats?.totalFoodItems },
  ];

  return (
    <>
      <div className="flex animate-fade-in-up flex-col gap-6">
        <h1 className="sr-only">Administration</h1>

        <SummaryCard title="Statistiques" busy={isLoading}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map(({ label, value }) => (
              <StatTile key={label} label={label}>
                {value === undefined ? (
                  hasError ? (
                    '–'
                  ) : (
                    <Skeleton className="h-6 w-14" />
                  )
                ) : (
                  value.toLocaleString('fr-FR')
                )}
              </StatTile>
            ))}
          </dl>
        </SummaryCard>

        <ListCard
          label="Utilisateurs"
          header={
            <AdminSearchBar criteria={criteria} onFilterChange={setCriteria} />
          }
        >
          {isLoading && (
            <ListCardLoading label="Chargement des utilisateurs..." />
          )}

          {users === null && hasError && (
            <LoadError
              message="Impossible de charger les utilisateurs."
              onRetry={retry}
            />
          )}

          {users !== null && visible.length === 0 && (
            <ListCardEmpty>
              Aucun utilisateur ne correspond à cette recherche.
            </ListCardEmpty>
          )}

          <ul className="divide-y divide-green-200">
            {visible.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-3 px-5 py-4 even:bg-gray-50"
              >
                <Avatar
                  username={user.username}
                  avatarUrl={user.avatarUrl}
                  online={user.onlineStatus}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-green-800">
                    @{user.username}
                    {user.deletedAt && (
                      <span className="ml-1.5 text-xs font-normal text-red-500">
                        Supprimé
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-green-500">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-green-500 max-xs:hidden">
                  {new Date(user.createAt).toLocaleDateString('fr-FR')}
                </span>
                <EditIconButton
                  label={`Ouvrir la fiche de @${user.username}`}
                  onClick={() => openUser(user)}
                />
              </li>
            ))}
          </ul>
        </ListCard>
      </div>

      <AdminUserDialog
        dialogRef={dialogRef}
        user={selected}
        openCount={dialog.openCount}
        onUpdated={(changes) => {
          if (!selected) {
            return;
          }
          mergeUser(selected.id, changes);
          if (changes.username && selected.id === currentUser?.userId) {
            updateCurrentUser({ username: changes.username });
          }
          if (changes.deletedAt && selected.id === currentUser?.userId) {
            void logout();
          }
        }}
      />
    </>
  );
}
