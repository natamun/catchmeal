interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'lg';
}

const SIZE = {
  xs: { container: 'h-5 w-5', text: 'text-xs', initials: 1 },
  sm: { container: 'h-10 w-10', text: 'text-sm', initials: 1 },
  lg: { container: 'h-16 w-16', text: 'text-2xl', initials: 2 },
} as const;

export function Avatar({ username, avatarUrl, size = 'sm' }: AvatarProps) {
  const { container, text, initials } = SIZE[size];

  return (
    <div role="img" aria-label={`Avatar de ${username}`} className="shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${username}`}
          className={`${container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${container} flex items-center justify-center rounded-full bg-green-100 font-bold text-green-400 ${text}`}
        >
          {username.slice(0, initials).toUpperCase()}
        </div>
      )}
    </div>
  );
}
