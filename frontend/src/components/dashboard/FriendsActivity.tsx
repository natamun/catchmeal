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
}: {
  activities: FriendActivity[];
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
      <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">
        Activité des amis
      </h2>
      {activities.length === 0 ? (
        <p className="text-green-500 text-sm text-center py-4">
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
                  className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-400 font-bold text-sm"
                  aria-hidden="true"
                >
                  {a.username[0].toUpperCase()}
                </div>
                {a.online && (
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-white"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
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
