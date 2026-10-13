import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

import PublicFooter from '../layout/PublicFooter';
import PublicHeader from '../layout/PublicHeader';

export type LegalPageId = 'confidentialite' | 'conditions' | 'mentions-legales';

const LEGAL_PAGES: { id: LegalPageId; label: string; shortLabel: string }[] = [
  {
    id: 'confidentialite',
    label: 'Politique de confidentialité',
    shortLabel: 'Confidentialité',
  },
  {
    id: 'conditions',
    label: "Conditions d'utilisation",
    shortLabel: 'Conditions',
  },
  {
    id: 'mentions-legales',
    label: 'Mentions légales',
    shortLabel: 'Mentions légales',
  },
];

interface Props {
  current: LegalPageId;
  onNavigate: (page: LegalPageId) => void;
  onBack: () => void;
  children: ReactNode;
}

export function LegalLayout({ current, onNavigate, onBack, children }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader
        links={LEGAL_PAGES.map(({ id, shortLabel }) => ({
          label: shortLabel,
          onClick: () => onNavigate(id),
          current: id === current,
        }))}
        action={{ label: 'Retour', icon: ArrowLeft, onClick: onBack }}
        onBrandClick={onBack}
      />
      <main
        id="main-content"
        className="legal-document mx-auto w-full max-w-prose flex-1 px-8 py-16"
      >
        {children}
      </main>
      <PublicFooter
        legalLinks={LEGAL_PAGES.map(({ id, label }) => ({
          label,
          onClick: () => onNavigate(id),
        }))}
      />
    </div>
  );
}
