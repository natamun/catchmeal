import { LegalLayout } from '../components/legal/LegalLayout';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';

/** Privacy policy page. */
export function PrivacyPolicyPage() {
  return (
    <LegalLayout>
      <h1>Politique de confidentialité et RGPD</h1>
      <PrivacyPolicyContent />
    </LegalLayout>
  );
}
