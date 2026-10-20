import { LegalLayout } from '../components/legal/LegalLayout';
import { TermsOfServiceContent } from '../components/legal/TermsOfServiceContent';

export function TermsOfServicePage() {
  return (
    <LegalLayout>
      <h1>Conditions générales d'utilisation</h1>
      <TermsOfServiceContent />
    </LegalLayout>
  );
}
