import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

interface ListCardProps {
  header?: ReactNode;
  label?: string;
  className?: string;
  children: ReactNode;
}

export function ListCard({
  header,
  label,
  className = '',
  children,
}: ListCardProps) {
  const Tag = label ? 'section' : 'div';

  return (
    <Tag
      aria-label={label}
      className={`overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm ${className}`}
    >
      {header && (
        <div className="flex items-center gap-3 border-b border-green-200 px-5 py-4">
          {header}
        </div>
      )}
      {children}
    </Tag>
  );
}

export function ListCardLoading({ label }: { label: string }) {
  return (
    <div role="status" className="flex justify-center py-10">
      <LoaderCircle className="h-6 w-6 animate-spin text-green-400" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ListCardEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-green-400">{children}</p>
  );
}
