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
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Bonjour {username}
        </h1>
        <p
          className="text-sm text-green-500 capitalize"
          aria-label={`Aujourd'hui : ${today}`}
        >
          {today}
        </p>
      </div>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-400"
        aria-label={`Avatar de ${username}`}
        role="img"
      >
        {username[0].toUpperCase()}
      </div>
    </header>
  );
}
