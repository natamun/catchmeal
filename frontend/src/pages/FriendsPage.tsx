const FRIENDS = [
  { id: 1, username: 'alice', kcal: 1740, goal: 2000, online: true },
  { id: 2, username: 'bob', kcal: 2000, goal: 2000, online: false },
  { id: 3, username: 'carol', kcal: 980, goal: 1800, online: true },
  { id: 4, username: 'david', kcal: 1200, goal: 2200, online: false },
];

const ACTIVITY = [
  {
    id: 1,
    username: 'alice',
    action: 'a ajouté un repas (540 kcal)',
    time: 'il y a 5 min',
    online: true,
  },
  {
    id: 2,
    username: 'bob',
    action: 'a atteint son objectif du jour',
    time: 'il y a 23 min',
    online: false,
  },
  {
    id: 3,
    username: 'carol',
    action: 'a enregistré son poids (63 kg)',
    time: 'il y a 1h',
    online: true,
  },
  {
    id: 4,
    username: 'david',
    action: 'a scanné un nouveau produit',
    time: 'il y a 2h',
    online: false,
  },
];

function Avatar({ username, online }: { username: string; online: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-400">
        {username[0].toUpperCase()}
      </div>
      {online && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-300" />
      )}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-800">Amis</h2>
        <button className="cursor-pointer text-sm font-medium text-green-300 transition-colors hover:text-green-400">
          + Ajouter
        </button>
      </div>

      {/* Liste des amis */}
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
        <p className="px-5 pt-5 pb-3 text-xs font-semibold tracking-wide text-green-500 uppercase">
          {FRIENDS.filter((f) => f.online).length} en ligne
        </p>
        <ul>
          {FRIENDS.map((f, i) => {
            const pct = Math.min((f.kcal / f.goal) * 100, 100);
            return (
              <li
                key={f.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < FRIENDS.length - 1 ? 'border-b border-green-200' : ''}`}
              >
                <Avatar username={f.username} online={f.online} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-green-800">
                      {f.username}
                    </p>
                    <p className="text-xs text-green-500">
                      {f.kcal} / {f.goal} kcal
                    </p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-green-100">
                    <div
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Activité récente */}
      <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-semibold tracking-wide text-green-500 uppercase">
          Activité récente
        </p>
        <ul className="flex flex-col gap-4">
          {ACTIVITY.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <Avatar username={a.username} online={a.online} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">{a.username}</span> {a.action}
                </p>
                <p className="text-xs text-green-500">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
