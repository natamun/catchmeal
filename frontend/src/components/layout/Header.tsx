interface Props {
  username: string;
}

export default function Header({ username }: Props) {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Bonjour {username}</h1>
        <p className="text-sm text-green-500 capitalize" aria-label={`Aujourd'hui : ${today}`}>{today}</p>
      </div>
      <div
        className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-400 font-bold text-sm"
        aria-label={`Avatar de ${username}`}
        role="img"
      >
        {username[0].toUpperCase()}
      </div>
    </header>
  );
}
