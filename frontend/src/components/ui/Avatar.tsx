interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  editable?: boolean;
}

const SIZE = {
  xs: { container: 'h-5 w-5', text: 'text-xs', initials: 1 },
  sm: { container: 'h-10 w-10', text: 'text-sm', initials: 1 },
  lg: { container: 'h-16 w-16', text: 'text-2xl', initials: 2 },
} as const;

export function Avatar({
  username,
  avatarUrl,
  size = 'sm',
  onClick,
  disabled,
  editable = false,
}: AvatarProps) {
  const { container, text, initials } = SIZE[size];
  const label = username.slice(0, initials).toUpperCase();

  const inner = (
    <>
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
          {label}
        </div>
      )}
      {editable && (
        <div className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-8 8A2 2 0 017 15H5v-2a2 2 0 01.586-1.414l8-8z" />
          </svg>
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`Avatar de ${username}`}
        className="relative shrink-0 cursor-pointer"
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Avatar de ${username}`}
      className="relative shrink-0"
    >
      {inner}
    </div>
  );
}
