import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { resendVerification } from '../auth/api';
import { Brand } from '../components/ui/Brand';
import { LABEL_CLASS } from '../components/ui/fieldStyle';
import { Input } from '../components/ui/Input';
import { navigationState } from '../routing/navigation';
import { PATHS } from '../routing/paths';
import { requestErrorMessage } from '../utils/requestErrorMessage';
import { isValidEmail } from '../utils/validation';

/**
 * Asks the user to open the confirmation link sent by email and lets them
 * request a new one. Reached after sign-up when confirmation is required, or
 * when an unconfirmed account tries to sign in (the address is then unknown
 * and the user types it).
 */
export function CheckEmailPage() {
  const location = useLocation();
  const knownEmail = navigationState(location).email;
  const [email, setEmail] = useState(knownEmail ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const address = email.trim();
    if (!isValidEmail(address)) {
      setError('Email invalide');
      return;
    }

    setIsSending(true);
    try {
      await resendVerification(address);
      setMessage(
        'Si un compte non confirmé existe pour cette adresse, un lien vous a été envoyé. Pensez à vérifier vos courriers indésirables.',
      );
    } catch (err: unknown) {
      setError(
        requestErrorMessage(err, "Impossible d'envoyer le lien. Réessayez."),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-green-50 px-6 text-center"
    >
      <Brand size="lg" />

      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-bold text-green-800">
          Vérifiez votre boîte mail
        </h1>
        <p className="text-sm text-green-600">
          {knownEmail ? (
            <>
              Un lien de confirmation a été envoyé à{' '}
              <strong>{knownEmail}</strong>. Ouvrez-le pour activer votre
              compte.
            </>
          ) : (
            "Votre adresse e-mail n'est pas encore confirmée. Entrez-la pour recevoir un lien de confirmation."
          )}
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="flex w-full max-w-sm flex-col gap-3"
      >
        {!knownEmail && (
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="check-email-address" className={LABEL_CLASS}>
              Adresse e-mail
            </label>
            <Input
              id="check-email-address"
              type="email"
              autoComplete="email"
              placeholder="nom@exemple.ch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSending}
          className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending
            ? 'Envoi...'
            : knownEmail
              ? 'Renvoyer le lien'
              : 'Envoyer le lien'}
        </button>
      </form>

      <Link
        to={PATHS.login}
        className="text-sm font-medium text-green-700 transition-colors hover:text-green-500"
      >
        Retour à la connexion
      </Link>
    </main>
  );
}
