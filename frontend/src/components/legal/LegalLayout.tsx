import { useEffect, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { PATHS } from '../../routes';
import PublicFooter from '../layout/PublicFooter';
import PublicHeader from '../layout/PublicHeader';
import { LEGAL_PAGES } from './legalPages';

interface Props {
  children: ReactNode;
}

export function LegalLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const goBack = () =>
    void (location.key === 'default' ? navigate(PATHS.landing) : navigate(-1));

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
