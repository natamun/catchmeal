// Skeleton — data will be wired up by a teammate

const SKELETON_USERS = [
  {
    id: 1,
    username: 'user_one',
    name: 'User One',
    email: 'user1@example.com',
    role: 'USER',
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    username: 'user_two',
    name: 'User Two',
    email: 'user2@example.com',
    role: 'USER',
    createdAt: '2026-01-02',
  },
  {
    id: 3,
    username: 'admin_one',
    name: 'Admin One',
    email: 'admin@example.com',
    role: 'ADMIN',
    createdAt: '2026-01-03',
  },
];

const SKELETON_STATS = {
  totalUsers: 42,
  totalMeals: 318,
  totalFoodItems: 1024,
};

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-green-800">Admin Board</h1>

      {/* Stats */}
      <section aria-labelledby="stats-title">
        <h2
          id="stats-title"
          className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase"
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
          className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase"
        >
          Users
        </h2>
        <div className="overflow-x-auto rounded-xl border border-green-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-green-200 bg-green-50 text-left text-xs font-semibold tracking-wide text-green-500 uppercase">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {SKELETON_USERS.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-green-50"
                >
                  <td className="px-4 py-3 text-green-600">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-green-800">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-green-700">{user.name}</td>
                  <td className="px-4 py-3 text-green-600">{user.email}</td>
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
                  <td className="px-4 py-3 text-green-600">{user.createdAt}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
