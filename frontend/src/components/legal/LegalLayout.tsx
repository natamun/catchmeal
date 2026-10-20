import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import { useGoBack } from '../../routing/navigation';
import { PATHS } from '../../routing/paths';
import { PublicFooter } from '../layout/PublicFooter';
import { PublicHeader } from '../layout/PublicHeader';
import { LEGAL_PAGES } from './legalPages';

interface Props {
  children: ReactNode;
}

export function LegalLayout({ children }: Props) {
  const goBack = useGoBack(PATHS.landing);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader
        links={LEGAL_PAGES.map(({ path, shortLabel }) => ({
          label: shortLabel,
          to: path,
        }))}
        action={{ label: 'Retour', icon: ArrowLeft, onClick: goBack }}
      />
      <main
        id="main-content"
        className="legal-document mx-auto w-full max-w-prose flex-1 px-8 py-16"
      >
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
