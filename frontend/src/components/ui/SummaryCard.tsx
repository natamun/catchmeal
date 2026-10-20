import type { ReactNode } from 'react';

interface Props {
  title: string;
  aside?: ReactNode;
  inlineAside?: boolean;
  busy?: boolean;
  className?: string;
  children: ReactNode;
}

export function SummaryCard({
  title,
  aside,
  inlineAside = false,
  busy = false,
  className = '',
  children,
}: Props) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-green-200 bg-white p-6 shadow-sm ${className}`}
      aria-busy={busy || undefined}
    >
      <div
        className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 ${inlineAside ? '' : 'justify-between'}`}
      >
        <h2 className="text-sm font-semibold tracking-wide text-green-500 uppercase">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </div>
  );
}
