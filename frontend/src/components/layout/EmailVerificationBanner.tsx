import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { resendVerification } from '../../auth/api';
import { useCurrentUser } from '../../auth/authContext';
import { requestErrorMessage } from '../../utils/requestErrorMessage';
import { useToast } from '../ui/toastContext';

/**
 * Reminder for a logged-in user whose email address is not confirmed yet
 * (possible when confirmation is not required to sign in). It offers to send
 * the link again and disappears once the address is confirmed.
 */
export function EmailVerificationBanner() {
  const { email, emailVerified } = useCurrentUser();
  const showToast = useToast();
  const [isSending, setIsSending] = useState(false);

  // Accounts without an address from their provider carry a made-up one.
  if (emailVerified !== false || !email || email.endsWith('.invalid')) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await resendVerification(email);
      showToast(
        'Vérifiez votre boîte mail : un lien de confirmation vous a été envoyé.',
      );
    } catch (err: unknown) {
      showToast(
        requestErrorMessage(err, "Impossible d'envoyer le lien. Réessayez."),
        AlertCircle,
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      aria-label="Confirmation de l'adresse e-mail"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-green-200 bg-green-100 px-4 py-2 text-center text-sm text-green-800"
    >
      <p>Confirmez votre adresse e-mail pour sécuriser votre compte.</p>
      <button
        type="button"
        onClick={() => void handleResend()}
        disabled={isSending}
        className="cursor-pointer font-semibold underline underline-offset-2 transition-colors hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? 'Envoi...' : 'Renvoyer le mail'}
      </button>
    </section>
  );
}
