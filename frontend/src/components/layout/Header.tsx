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
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-green-800">Bonjour {username}</h1>
      <p
        className="text-sm text-green-500 capitalize"
        aria-label={`Aujourd'hui : ${today}`}
      >
        {today}
      </p>
    </header>
  );
}
