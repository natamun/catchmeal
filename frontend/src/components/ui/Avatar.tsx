interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'lg';
  online?: boolean;
  /** A deleted account: neutral placeholder, never an online dot. */
  deleted?: boolean;
}

const SIZE = {
  xs: { container: 'h-5 w-5', text: 'text-xs', initials: 1 },
  sm: { container: 'h-10 w-10', text: 'text-sm', initials: 1 },
  lg: { container: 'h-16 w-16', text: 'text-2xl', initials: 2 },
} as const;

/**
 * Profile picture, or the first letter(s) of the username when there is none.
 * `online` adds a green dot.
 */
export function Avatar({
  username,
  avatarUrl,
  size = 'sm',
  online = false,
  deleted = false,
}: AvatarProps) {
  const { container, text, initials } = SIZE[size];

  // A deleted account shows a neutral grey placeholder, never a photo or dot.
  if (deleted) {
    return (
      <div
        role="img"
        aria-label="Compte supprimé"
        className={`${container} flex shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-400 ${text}`}
      >
        ?
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Avatar de ${username}${online ? ', en ligne' : ''}`}
      className="relative shrink-0"
    >
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
      {online && (
        <span
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-300"
          aria-label="En ligne"
        />
      )}
    </div>
  );
}
