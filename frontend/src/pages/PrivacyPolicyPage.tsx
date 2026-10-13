import { LegalLayout, type LegalPageId } from '../components/legal/LegalLayout';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';

interface Props {
  onBack: () => void;
  onNavigate: (page: LegalPageId) => void;
}

export default function PrivacyPolicyPage({ onBack, onNavigate }: Props) {
  return (
    <LegalLayout
      current="confidentialite"
      onNavigate={onNavigate}
      onBack={onBack}
    >
      <h1>Politique de confidentialité et RGPD</h1>
      <PrivacyPolicyContent />
    </LegalLayout>
  );
}
