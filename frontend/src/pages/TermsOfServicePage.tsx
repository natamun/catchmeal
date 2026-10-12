import { LegalLayout, type LegalPageId } from '../components/legal/LegalLayout';
import { TermsOfServiceContent } from '../components/legal/TermsOfServiceContent';

interface Props {
  onBack: () => void;
  onNavigate: (page: LegalPageId) => void;
}

export default function TermsOfServicePage({ onBack, onNavigate }: Props) {
  return (
    <LegalLayout current="conditions" onNavigate={onNavigate} onBack={onBack}>
      <h1>Conditions générales d'utilisation</h1>
      <TermsOfServiceContent />
    </LegalLayout>
  );
}
