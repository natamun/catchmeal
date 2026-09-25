export interface FriendActivity {
  id: number;
  username: string;
  avatar?: string;
  action: string;
  time: string;
  online: boolean;
}

export default function FriendsActivity({
  activities,
  isLoading = false,
  loadError = null,
}: {
  activities: FriendActivity[];
  isLoading?: boolean;
  loadError?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase">
        Mes amis
      </h2>
      {loadError ? (
        <p className="py-4 text-center text-sm text-red-400">{loadError}</p>
      ) : isLoading ? null : activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-green-400">
          Ajoute des amis pour les voir apparaître ici
        </p>
      ) : (
        <ul className="flex flex-wrap gap-4" aria-label="Mes amis">
          {activities.map((a) => (
            <li key={a.id} className="flex flex-col items-center gap-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-500"
                aria-label={`Avatar de ${a.username}`}
              >
                {a.username[0].toUpperCase()}
              </div>
              <p className="text-xs text-green-700">{a.username}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
