import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../auth/auth-context';
import AdminSearchBar from '../components/admin/AdminSearchBar';
import * as adminApi from '../components/admin/api';
import type { AdminStats, AdminUser } from '../components/admin/api';
import {
  EMPTY_ADMIN_FILTER,
  type AdminFilterCriteria,
} from '../components/admin/types';
import { BaseDialog } from '../components/ui/BaseDialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
      {user.username[0].toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        role === 'ADMIN'
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        status === 'active'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-600'
      }`}
    >
      {status}
    </span>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-green-400' : 'bg-gray-300'}`}
      title={online ? 'En ligne' : 'Hors ligne'}
    />
  );
}

function OAuthBadge({ provider }: { provider: string | null }) {
  if (!provider) return <span className="text-xs text-green-400">local</span>;
  return (
    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
      {provider}
    </span>
  );
}

// ─── Details Dialog ───────────────────────────────────────────────────────────

interface DetailsDialogProps {
  user: AdminUser | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
}

function UserDetailsDialog({ user, dialogRef, onClose }: DetailsDialogProps) {
  if (!user) return null;
  const accountStatus = user.deletedAt ? 'deleted' : 'active';
  const friendsCount = user._count?.userFriend ?? 0;

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title="Détails utilisateur"
      maxWidth="lg"
      onClose={onClose}
    >
      <div className="flex flex-col gap-6">
        {/* Profile */}
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Profil
          </p>
          <div className="flex items-center gap-4 rounded-xl border border-green-200 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-green-800">{user.name}</p>
              <p className="text-sm text-green-600">@{user.username}</p>
              <p className="text-sm text-green-500">{user.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-green-500">
                <OnlineDot online={user.onlineStatus} />
                {user.onlineStatus ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Compte
          </p>
          <div className="divide-y divide-green-100 rounded-xl border border-green-200">
            {[
              { label: 'ID utilisateur', value: String(user.id) },
              { label: 'Rôle', value: <RoleBadge role={user.role} /> },
              {
                label: 'Statut du compte',
                value: <StatusBadge status={accountStatus} />,
              },
              {
                label: 'Fournisseur OAuth',
                value: <OAuthBadge provider={user.oauthProvider} />,
              },
              {
                label: 'Créé le',
                value: new Date(user.createAt).toLocaleDateString(),
              },
              {
                label: 'Dernière activité',
                value: user.lastSeenAt ? (
                  new Date(user.lastSeenAt).toLocaleString()
                ) : (
                  <span className="text-xs text-green-400">—</span>
                ),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3"
              >
                <p className="text-sm text-green-500">{label}</p>
                <p className="text-sm font-medium text-green-800">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social */}
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Social
          </p>
          <div className="rounded-xl border border-green-200">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm text-green-500">Amis</p>
              <p className="text-sm font-medium text-green-800">
                {friendsCount}
              </p>
            </div>
          </div>
        </section>
      </div>
    </BaseDialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditDialogProps {
  user: AdminUser | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  onSave: (role: 'USER' | 'ADMIN') => void;
  isPending: boolean;
}

function EditUserDialog({
  user,
  dialogRef,
  onClose,
  onSave,
  isPending,
}: EditDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN'>('USER');

  if (!user) return null;

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title={`Edit — @${user.username}`}
      maxWidth="sm"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-green-600">
          Seul le rôle peut être modifié depuis ce panneau.
        </p>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-role"
            className="text-xs font-semibold tracking-wide text-green-500 uppercase"
          >
            Rôle
          </label>
          <select
            id="edit-role"
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as 'USER' | 'ADMIN')
            }
            className="rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="flex-1 cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSave(selectedRole)}
            className="flex-1 cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user: currentUser, logout } = useAuth();
  const [criteria, setCriteria] =
    useState<AdminFilterCriteria>(EMPTY_ADMIN_FILTER);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pendingDialogRef = useRef<'details' | 'edit' | 'delete' | null>(null);

  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    void adminApi.getUsers().then(setUsers);
    void adminApi.getStats().then(setStats);
  }, []);

  useEffect(() => {
    if (!pendingDialogRef.current || !selectedUser) return;
    const target = pendingDialogRef.current;
    pendingDialogRef.current = null;
    if (target === 'details') detailsDialogRef.current?.showModal();
    if (target === 'edit') editDialogRef.current?.showModal();
    if (target === 'delete') deleteDialogRef.current?.showModal();
  }, [selectedUser]);

  const query = criteria.query.trim().toLowerCase();

  const filtered = users
    .filter((user) => {
      const matchesQuery =
        !query ||
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole =
        criteria.role === 'all' || user.role === criteria.role;

      const matchesStatus =
        criteria.status === 'all' ||
        (criteria.status === 'deleted'
          ? user.deletedAt !== null
          : user.deletedAt === null);

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
    })
    .sort((a, b) => {
      const { field, direction } = criteria.sort;
      const dir = direction === 'asc' ? 1 : -1;
      if (field === 'name') return a.username.localeCompare(b.username) * dir;
      if (field === 'role') return a.role.localeCompare(b.role) * dir;
      if (field === 'createdAt')
        return a.createAt.localeCompare(b.createAt) * dir;
      return 0;
    });

  const openDetails = (user: AdminUser) => {
    pendingDialogRef.current = 'details';
    void adminApi
      .getUserById(user.id)
      .then((fresh) => setSelectedUser(fresh))
      .catch(() => setSelectedUser(user));
  };

  const openEdit = (user: AdminUser) => {
    pendingDialogRef.current = 'edit';
    setSelectedUser(user);
  };

  const openDelete = (user: AdminUser) => {
    pendingDialogRef.current = 'delete';
    setSelectedUser(user);
  };

  const handleSaveRole = (role: 'USER' | 'ADMIN') => {
    if (!selectedUser) return;
    setIsPending(true);
    adminApi
      .updateUserRole(selectedUser.id, role)
      .then((updated) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id ? { ...u, role: updated.role } : u,
          ),
        );
        editDialogRef.current?.close();
      })
      .finally(() => setIsPending(false));
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    setIsPending(true);
    adminApi
      .deleteUser(selectedUser.id)
      .then((updated) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id ? { ...u, deletedAt: updated.deletedAt } : u,
          ),
        );
        deleteDialogRef.current?.close();
        if (currentUser?.userId === selectedUser.id) void logout();
      })
      .finally(() => setIsPending(false));
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">
            Tableau de bord Admin
          </h1>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Admin
          </span>
        </div>

        {/* Stats */}
        <section aria-labelledby="stats-title">
          <h2
            id="stats-title"
            className="mb-4 text-xs font-semibold tracking-wide text-green-500 uppercase"
          >
            Statistiques
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total utilisateurs', value: stats?.totalUsers ?? '—' },
              { label: 'Total repas', value: stats?.totalMeals ?? '—' },
              { label: 'Total aliments', value: stats?.totalFoodItems ?? '—' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-green-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs text-green-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-green-800">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Users */}
        <section aria-labelledby="users-title">
          <h2
            id="users-title"
            className="mb-4 text-xs font-semibold tracking-wide text-green-500 uppercase"
          >
            Utilisateurs
          </h2>

          {/* Search & Filters */}
          <div className="mb-4 flex items-center gap-3">
            <AdminSearchBar criteria={criteria} onFilterChange={setCriteria} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-green-200 bg-green-50 text-left text-xs font-semibold tracking-wide text-green-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Identifiant</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">OAuth</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">En ligne</th>
                  <th className="px-4 py-3">Créé le</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-sm text-green-400"
                    >
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="transition-colors">
                      <td className="px-4 py-3">
                        <UserAvatar user={user} />
                      </td>
                      <td className="px-4 py-3 font-medium text-green-800">
                        @{user.username}
                      </td>
                      <td className="px-4 py-3 text-green-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <OAuthBadge provider={user.oauthProvider} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={user.deletedAt ? 'deleted' : 'active'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <OnlineDot online={user.onlineStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-green-600">
                        {new Date(user.createAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetails(user)}
                            className="cursor-pointer rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                          >
                            Voir
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="cursor-pointer rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(user)}
                            className="cursor-pointer rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <UserDetailsDialog
        user={selectedUser}
        dialogRef={detailsDialogRef}
        onClose={() => setSelectedUser(null)}
      />

      <EditUserDialog
        user={selectedUser}
        dialogRef={editDialogRef}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveRole}

        isPending={isPending}
      />

      <ConfirmDialog
        dialogRef={deleteDialogRef}
        title="Supprimer l'utilisateur"
        description={
          selectedUser
            ? `Êtes-vous sûr de vouloir supprimer @${selectedUser.username} ? Cette action est irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        pendingLabel="Suppression..."
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
