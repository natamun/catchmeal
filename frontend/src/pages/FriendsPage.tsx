const FRIENDS = [
  { id: 1, username: 'alice', kcal: 1740, goal: 2000, online: true },
  { id: 2, username: 'bob', kcal: 2000, goal: 2000, online: false },
  { id: 3, username: 'carol', kcal: 980, goal: 1800, online: true },
  { id: 4, username: 'david', kcal: 1200, goal: 2200, online: false },
];

const ACTIVITY = [
  { id: 1, username: 'alice', action: 'a ajouté un repas (540 kcal)', time: 'il y a 5 min', online: true },
  { id: 2, username: 'bob', action: 'a atteint son objectif du jour', time: 'il y a 23 min', online: false },
  { id: 3, username: 'carol', action: 'a enregistré son poids (63 kg)', time: 'il y a 1h', online: true },
  { id: 4, username: 'david', action: 'a scanné un nouveau produit', time: 'il y a 2h', online: false },
];

function Avatar({ username, online }: { username: string; online: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-400 font-bold text-sm">
        {username[0].toUpperCase()}
      </div>
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-white" />}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-800">Amis</h2>
        <button className="text-sm font-medium text-green-300 hover:text-green-400 cursor-pointer transition-colors">
          + Ajouter
        </button>
      </div>

      {/* Liste des amis */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide px-5 pt-5 pb-3">
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-green-800 text-sm">{f.username}</p>
                    <p className="text-xs text-green-500">{f.kcal} / {f.goal} kcal</p>
                  </div>
                  <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm">
        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-4">Activité récente</p>
        <ul className="flex flex-col gap-4">
          {ACTIVITY.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <Avatar username={a.username} online={a.online} />
              <div className="flex-1 min-w-0">
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
