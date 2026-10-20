import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  inline?: boolean;
  children: ReactNode;
}

export function FeatureCard({
  icon: Icon,
  title,
  inline = false,
  children,
}: Props) {
  return (
    <article
      className={`rounded-xl border border-green-200 bg-white p-6 shadow-sm ${inline ? 'flex gap-4' : ''}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 ${inline ? '' : 'mb-4'}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="mb-2 font-semibold text-green-800">{title}</h3>
        <p className="text-sm leading-relaxed text-green-600">{children}</p>
      </div>
    </article>
  );
}
