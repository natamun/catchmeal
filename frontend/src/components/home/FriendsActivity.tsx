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
        Activité des amis
      </h2>
      {isLoading ? null : loadError ? (
        <p className="py-4 text-center text-sm text-green-500">{loadError}</p>
      ) : activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-green-500">
          Aucune activité récente
        </p>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Activité des amis">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <div
                className="relative shrink-0"
                role="img"
                aria-label={`Avatar de ${a.username}${a.online ? ', en ligne' : ', hors ligne'}`}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-400"
                  aria-hidden="true"
                >
                  {a.username[0].toUpperCase()}
                </div>
                {a.online && (
                  <span
                    className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-300"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">{a.username}</span> {a.action}
                </p>
                <p className="text-xs text-green-500">{a.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
