// Skeleton — real data will be wired up by a teammate
import { useEffect, useRef, useState } from 'react';

import { BaseDialog } from '../components/ui/BaseDialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

// ─── Skeleton data ────────────────────────────────────────────────────────────

interface SkeletonUser {
  id: number;
  avatarUrl: string | null;
  username: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  oauthProvider: string | null; // no field in DB yet — placeholder
  accountStatus: 'active' | 'deleted';
  onlineStatus: boolean; // no field in DB yet — placeholder
  lastActivity: string | null; // no field in DB yet — placeholder
  friendsCount: number; // will come from _count.userFriend
  createdAt: string;
}

const SKELETON_USERS: SkeletonUser[] = [
  {
    id: 1,
    avatarUrl: null,
    username: 'alice_w',
    name: 'Alice Walker',
    email: 'alice@example.com',
    role: 'USER',
    oauthProvider: 'google',
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 08:42',
    friendsCount: 12,
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    avatarUrl: null,
    username: 'bob_m',
    name: 'Bob Martin',
    email: 'bob@example.com',
    role: 'USER',
    oauthProvider: 'github',
    accountStatus: 'active',
    onlineStatus: false,
    lastActivity: '2026-09-26 14:10',
    friendsCount: 5,
    createdAt: '2026-01-02',
  },
  {
    id: 3,
    avatarUrl: null,
    username: 'carol_d',
    name: 'Carol Dupont',
    email: 'carol@example.com',
    role: 'USER',
    oauthProvider: null,
    accountStatus: 'deleted',
    onlineStatus: false,
    lastActivity: null,
    friendsCount: 3,
    createdAt: '2026-01-03',
  },
  {
    id: 4,
    avatarUrl: null,
    username: 'dan_42',
    name: 'Dan Fortytwo',
    email: 'dan@example.com',
    role: 'USER',
    oauthProvider: '42',
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 09:15',
    friendsCount: 8,
    createdAt: '2026-02-10',
  },
  {
    id: 5,
    avatarUrl: null,
    username: 'eve_admin',
    name: 'Eve Admin',
    email: 'eve@example.com',
    role: 'ADMIN',
    oauthProvider: null,
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 09:30',
    friendsCount: 0,
    createdAt: '2026-01-01',
  },
];

const SKELETON_STATS = {
  totalUsers: 42,
  totalMeals: 318,
  totalFoodItems: 1024,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: SkeletonUser }) {
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
      title={online ? 'Online' : 'Offline'}
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
  user: SkeletonUser | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
}

function UserDetailsDialog({ user, dialogRef, onClose }: DetailsDialogProps) {
  if (!user) return null;

  return (
    <BaseDialog
      dialogRef={dialogRef}
      title="User Details"
      maxWidth="lg"
      onClose={onClose}
    >
      <div className="flex flex-col gap-6">
        {/* Profile */}
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Profile
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
                {user.onlineStatus ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <p className="mb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
            Account
          </p>
          <div className="divide-y divide-green-100 rounded-xl border border-green-200">
            {[
              { label: 'User ID', value: String(user.id) },
              { label: 'Role', value: <RoleBadge role={user.role} /> },
              {
                label: 'Account Status',
                value: <StatusBadge status={user.accountStatus} />,
              },
              {
                label: 'OAuth Provider',
                value: <OAuthBadge provider={user.oauthProvider} />,
              },
              { label: 'Created At', value: user.createdAt },
              {
                label: 'Last Activity',
                value: user.lastActivity ?? (
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
              <p className="text-sm text-green-500">Friends</p>
              <p className="text-sm font-medium text-green-800">
                {user.friendsCount}
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
  user: SkeletonUser | null;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  onSave: () => void;
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
          Only the role can be modified from this panel.
        </p>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-role"
            className="text-xs font-semibold tracking-wide text-green-500 uppercase"
          >
            Role
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
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onSave()}
            className="flex-1 cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'online' | 'active' | 'deleted';

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedUser, setSelectedUser] = useState<SkeletonUser | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pendingDialogRef = useRef<'details' | 'edit' | 'delete' | null>(null);

  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!pendingDialogRef.current || !selectedUser) return;
    const target = pendingDialogRef.current;
    pendingDialogRef.current = null;
    if (target === 'details') detailsDialogRef.current?.showModal();
    if (target === 'edit') editDialogRef.current?.showModal();
    if (target === 'delete') deleteDialogRef.current?.showModal();
  }, [selectedUser]);

  const filtered = SKELETON_USERS.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'online' && user.onlineStatus) ||
      (filterStatus === 'active' && user.accountStatus === 'active') ||
      (filterStatus === 'deleted' && user.accountStatus === 'deleted');

    return matchesSearch && matchesFilter;
  });

  const openDetails = (user: SkeletonUser) => {
    pendingDialogRef.current = 'details';
    setSelectedUser(user);
  };

  const openEdit = (user: SkeletonUser) => {
    pendingDialogRef.current = 'edit';
    setSelectedUser(user);
  };

  const openDelete = (user: SkeletonUser) => {
    pendingDialogRef.current = 'delete';
    setSelectedUser(user);
  };

  const handleSaveRole = () => {
    // TODO: call PATCH /admin/users/:id/role — wired up by teammate
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      editDialogRef.current?.close();
    }, 500);
  };

  const handleDelete = () => {
    // TODO: call DELETE /admin/users/:id — wired up by teammate
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      deleteDialogRef.current?.close();
    }, 500);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-800">Admin Board</h1>
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
            Statistics
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Users', value: SKELETON_STATS.totalUsers },
              { label: 'Total Meals', value: SKELETON_STATS.totalMeals },
              {
                label: 'Total Food Items',
                value: SKELETON_STATS.totalFoodItems,
              },
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
            Users
          </h2>

          {/* Search & Filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Search by username, name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-green-200 bg-white px-4 py-2 text-sm text-green-800 placeholder-green-300 outline-none focus:ring-2 focus:ring-green-300 sm:max-w-xs"
            />
            <div className="flex gap-2">
              {(['all', 'online', 'active', 'deleted'] as FilterStatus[]).map(
                (f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterStatus(f)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filterStatus === f
                        ? 'bg-green-500 text-white'
                        : 'border border-green-200 bg-white text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-green-200 bg-green-50 text-left text-xs font-semibold tracking-wide text-green-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Avatar</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">OAuth</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Online</th>
                  <th className="px-4 py-3">Created At</th>
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
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-green-50"
                    >
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
                        <StatusBadge status={user.accountStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <OnlineDot online={user.onlineStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-green-600">
                        {user.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetails(user)}
                            className="cursor-pointer rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="cursor-pointer rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(user)}
                            className="cursor-pointer rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Delete
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
        title="Delete user"
        description={
          selectedUser
            ? `Are you sure you want to delete @${selectedUser.username}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
