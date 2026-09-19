import { Avatar } from '../ui/Avatar';

interface Props {
  username: string;
  avatarUrl?: string | null;
}

export default function Header({ username, avatarUrl }: Props) {
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
      <Avatar username={username} avatarUrl={avatarUrl} size="sm" />
    </header>
  );
}
