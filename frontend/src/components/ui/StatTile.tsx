import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

export default function StatTile({ label, children }: Props) {
  return (
    <div className="rounded-xl bg-green-50 px-3 py-1.5">
      <dt className="text-xs text-green-600">{label}</dt>
      <dd className="font-semibold text-green-800">{children}</dd>
    </div>
  );
}
