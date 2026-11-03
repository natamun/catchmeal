import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { verifyEmail } from '../auth/api';
import { useAuth } from '../auth/authContext';
import { Brand } from '../components/ui/Brand';
import { PATHS } from '../routing/paths';
import { ApiError } from '../utils/request';
import { requestErrorMessage } from '../utils/requestErrorMessage';

type Outcome =
  | { status: 'pending' }
  | { status: 'loading' }
  | { status: 'verified' }
  | { status: 'failed'; message: string };

const MISSING_TOKEN_MESSAGE =
  "Ce lien est incomplet. Ouvrez-le depuis l'e-mail reçu.";

const LINK_CLASS =
  'rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600';

const BUTTON_CLASS =
  'rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * For a 400 the backend's own message says what is wrong with the link
 * (invalid, expired, already used); any other failure gets the generic text.
 */
function failureMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return error.message;
  }
  return requestErrorMessage(
    error,
    'Impossible de confirmer votre adresse. Réessayez.',
  );
}

/**
 * Page opened by the link of the confirmation email (/verify-email?token=...).
 * Shows a confirmation button to avoid prefetch issues with email clients.
 * The user must click the button to actually verify their email.
 */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, updateUser } = useAuth();
  const [outcome, setOutcome] = useState<Outcome>(
    token
      ? { status: 'pending' }
      : { status: 'failed', message: MISSING_TOKEN_MESSAGE },
  );

  const handleConfirm = async () => {
    if (!token) return;

    setOutcome({ status: 'loading' });
    try {
      await verifyEmail(token);
      setOutcome({ status: 'verified' });
      updateUser({ emailVerified: true });
    } catch (error: unknown) {
      setOutcome({ status: 'failed', message: failureMessage(error) });
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-green-50 px-6 text-center"
    >
      <Brand size="lg" />

      {outcome.status === 'pending' && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-green-800">
              Confirmer votre adresse e-mail
            </h1>
            <p className="text-sm text-green-600">
              Cliquez sur le bouton ci-dessous pour confirmer votre adresse.
            </p>
          </div>
          <button
            onClick={() => {
              void handleConfirm();
            }}
            className={BUTTON_CLASS}
          >
            Confirmer mon adresse
          </button>
        </>
      )}

      {outcome.status === 'loading' && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-green-600"
        >
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Confirmation de votre adresse...
        </p>
      )}

      {outcome.status === 'verified' && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-green-800">
              Adresse confirmée
            </h1>
            <p className="text-sm text-green-600">
              Merci, votre adresse e-mail est confirmée.
            </p>
          </div>
          <Link to={user ? PATHS.home : PATHS.login} className={LINK_CLASS}>
            {user ? "Aller à l'accueil" : 'Se connecter'}
          </Link>
        </>
      )}

      {outcome.status === 'failed' && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-green-800">
              Confirmation impossible
            </h1>
            <p role="alert" className="text-sm text-green-600">
              {outcome.message}
            </p>
            <p className="text-sm text-green-600">
              {user
                ? 'Vous pouvez demander un nouveau lien depuis le bandeau de confirmation.'
                : 'Connectez-vous pour demander un nouveau lien.'}
            </p>
          </div>
          <Link to={user ? PATHS.home : PATHS.login} className={LINK_CLASS}>
            {user ? "Retour à l'accueil" : 'Se connecter'}
          </Link>
        </>
      )}
    </main>
  );
}
