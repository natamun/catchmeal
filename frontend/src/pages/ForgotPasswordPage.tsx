import { useState } from 'react';
import { Link } from 'react-router';

import { forgotPassword } from '../auth/api';
import { Brand } from '../components/ui/Brand';
import { FieldError } from '../components/ui/FieldError';
import { LABEL_CLASS } from '../components/ui/fieldStyle';
import { Input } from '../components/ui/Input';
import { useFormValidation } from '../hooks/useFormValidation';
import { PATHS } from '../routing/paths';
import { requestErrorMessage } from '../utils/requestErrorMessage';
import { isValidEmail } from '../utils/validation';

interface ForgotFormState {
  email: string;
}

function validateForm(
  form: ForgotFormState,
): Partial<Record<keyof ForgotFormState, string>> {
  return isValidEmail(form.email.trim()) ? {} : { email: 'Email invalide' };
}

/**
 * Asks for the address of the account and sends a reset link. The answer is the
 * same whether or not the address has an account, so nobody can use this page
 * to find out who is registered.
 */
export function ForgotPasswordPage() {
  const {
    form,
    handleChange,
    handleFocus,
    handleBlur,
    isInvalid,
    errorMessage,
    attemptSubmit,
  } = useFormValidation<ForgotFormState>({ email: '' }, validateForm);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!attemptSubmit()) {
      return;
    }

    setIsSending(true);
    try {
      await forgotPassword(form.email.trim());
      setSent(true);
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
          Mot de passe oublié
        </h1>
        <p className="text-sm text-green-600">
          {sent
            ? 'Si un compte avec mot de passe existe pour cette adresse, un lien de réinitialisation vient de vous être envoyé. Il est valable 1 heure. Pensez à vérifier vos courriers indésirables.'
            : "Entrez l'adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe."}
        </p>
      </div>

      {!sent && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <div className="relative flex flex-col gap-1.5 text-left">
            <label htmlFor="forgot-email" className={LABEL_CLASS}>
              Adresse e-mail
            </label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="nom@exemple.ch"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              aria-invalid={isInvalid('email')}
              aria-describedby="forgot-email-error"
            />
            <FieldError
              id="forgot-email-error"
              message={errorMessage('email')}
            />
          </div>

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
            {isSending ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      <Link
        to={PATHS.login}
        className="text-sm font-medium text-green-700 transition-colors hover:text-green-500"
      >
        Retour à la connexion
      </Link>
    </main>
  );
}
