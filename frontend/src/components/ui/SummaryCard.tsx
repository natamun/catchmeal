import type { ReactNode } from 'react';

interface Props {
  title: string;
  busy?: boolean;
  className?: string;
  children: ReactNode;
}

export default function SummaryCard({
  title,
  busy = false,
  className = '',
  children,
}: Props) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-green-200 bg-white p-6 shadow-sm ${className}`}
      aria-busy={busy || undefined}
    >
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-green-500 uppercase">
        {title}
      </h2>
      {children}
    </div>
  );
}
