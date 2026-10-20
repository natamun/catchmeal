/** Pulsing block that holds the place of content while it loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded bg-green-100 ${className}`}
      aria-hidden="true"
    />
  );
}
