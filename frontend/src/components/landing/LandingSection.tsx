import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  tinted?: boolean;
  children: ReactNode;
}

export default function LandingSection({
  id,
  title,
  tinted = false,
  children,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-(--header-height) px-8 py-20 ${tinted ? 'border-y border-green-200 bg-green-50' : ''}`}
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id={`${id}-title`}
          className="mb-10 text-3xl font-bold text-green-800 md:text-4xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
