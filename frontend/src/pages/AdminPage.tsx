// Skeleton — real data will be wired up by a teammate
import { useState } from 'react';

const SKELETON_USERS = [
  {
    id: 1,
    avatar: null,
    username: 'alice_w',
    name: 'Alice Walker',
    email: 'alice@example.com',
    role: 'USER',
    oauthProvider: 'google',
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 08:42',
    friends: 12,
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    avatar: null,
    username: 'bob_m',
    name: 'Bob Martin',
    email: 'bob@example.com',
    role: 'USER',
    oauthProvider: 'github',
    accountStatus: 'active',
    onlineStatus: false,
    lastActivity: '2026-09-26 14:10',
    friends: 5,
    createdAt: '2026-01-02',
  },
  {
    id: 3,
    avatar: null,
    username: 'carol_d',
    name: 'Carol Dupont',
    email: 'carol@example.com',
    role: 'USER',
    oauthProvider: null,
    accountStatus: 'deleted',
    onlineStatus: false,
    lastActivity: '2026-09-20 09:00',
    friends: 3,
    createdAt: '2026-01-03',
  },
  {
    id: 4,
    avatar: null,
    username: 'dan_42',
    name: 'Dan Fortytwo',
    email: 'dan@example.com',
    role: 'USER',
    oauthProvider: '42',
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 09:15',
    friends: 8,
    createdAt: '2026-02-10',
  },
  {
    id: 5,
    avatar: null,
    username: 'eve_admin',
    name: 'Eve Admin',
    email: 'eve@example.com',
    role: 'ADMIN',
    oauthProvider: null,
    accountStatus: 'active',
    onlineStatus: true,
    lastActivity: '2026-09-27 09:30',
    friends: 0,
    createdAt: '2026-01-01',
  },
];

const SKELETON_STATS = {
  totalUsers: 42,
  totalMeals: 318,
  totalFoodItems: 1024,
};

type FilterStatus = 'all' | 'online' | 'active' | 'deleted';

export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-green-800">Admin Board</h1>

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
            { label: 'Total Food Items', value: SKELETON_STATS.totalFoodItems },
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

      {/* Users table */}
      <section aria-labelledby="users-title">
        <h2
          id="users-title"
          className="mb-4 text-xs font-semibold tracking-wide text-green-500 uppercase"
        >
          Users
        </h2>

        {/* Search & Filter */}
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

        <div className="overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-green-200 bg-green-50 text-left text-xs font-semibold tracking-wide text-green-500 uppercase">
              <tr>
                <th className="px-4 py-3">Avatar</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">OAuth Provider</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Online</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3">Friends</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
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
                    {/* Avatar */}
                    <td className="px-4 py-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3 text-green-600">{user.id}</td>

                    {/* Username */}
                    <td className="px-4 py-3 font-medium text-green-800">
                      {user.username}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-green-700">{user.name}</td>

                    {/* Email */}
                    <td className="px-4 py-3 text-green-600">{user.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* OAuth Provider */}
                    <td className="px-4 py-3">
                      {user.oauthProvider ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                          {user.oauthProvider}
                        </span>
                      ) : (
                        <span className="text-xs text-green-400">local</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          user.accountStatus === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {user.accountStatus}
                      </span>
                    </td>

                    {/* Online Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          user.onlineStatus ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                        title={user.onlineStatus ? 'Online' : 'Offline'}
                      />
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3 text-xs text-green-600">
                      {user.lastActivity}
                    </td>

                    {/* Friends */}
                    <td className="px-4 py-3 text-center text-green-700">
                      {user.friends}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-xs text-green-600">
                      {user.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg border border-green-200 px-3 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                        >
                          Change Role
                        </button>
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
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
  );
}
