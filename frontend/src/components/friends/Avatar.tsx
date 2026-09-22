export function Avatar({
  username,
  online = false,
}: {
  username: string;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-400">
        {username[0].toUpperCase()}
      </div>
      {online && (
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-300" />
      )}
    </div>
  );
}
