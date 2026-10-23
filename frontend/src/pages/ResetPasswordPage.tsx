import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { resetPassword } from '../auth/api';
import { Brand } from '../components/ui/Brand';
import { FieldError } from '../components/ui/FieldError';
import { LABEL_CLASS } from '../components/ui/fieldStyle';
import { Input } from '../components/ui/Input';
import { useFormValidation } from '../hooks/useFormValidation';
import { PATHS } from '../routing/paths';
import { ApiError } from '../utils/request';
import { requestErrorMessage } from '../utils/requestErrorMessage';
import {
  MAX_LENGTH,
  maxLengthMessage,
  MIN_LENGTH,
  minLengthMessage,
} from '../utils/validation';

interface ResetFormState {
  password: string;
  confirmation: string;
}

const EMPTY_FORM: ResetFormState = { password: '', confirmation: '' };

const MISSING_TOKEN_MESSAGE =
  "Ce lien est incomplet. Ouvrez-le depuis l'e-mail reçu.";

const LINK_CLASS =
  'text-sm font-medium text-green-700 transition-colors hover:text-green-500';

function validateForm(
  form: ResetFormState,
): Partial<Record<keyof ResetFormState, string>> {
  const errors: Partial<Record<keyof ResetFormState, string>> = {};

  if (form.password.length < MIN_LENGTH.password) {
    errors.password = minLengthMessage(MIN_LENGTH.password);
  } else if (form.password.length > MAX_LENGTH.password) {
    errors.password = maxLengthMessage(MAX_LENGTH.password);
  }

  if (form.confirmation !== form.password) {
    errors.confirmation = 'Les mots de passe ne correspondent pas';
  }

  return errors;
}

/**
 * For a 400 the backend's own French message says what is wrong with the link
 * (invalid, expired, already used); any other failure gets the generic text.
 */
function failureMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 400) {
    return error.message;
  }
  return requestErrorMessage(
    error,
    'Impossible de modifier le mot de passe. Réessayez.',
  );
}

/**
 * Page opened by the link of the reset email (/reset-password?token=...): the
 * user chooses a new password. It is public, the user is not signed in.
 */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const {
    form,
    handleChange,
    handleFocus,
    handleBlur,
    isInvalid,
    errorMessage,
    attemptSubmit,
  } = useFormValidation(EMPTY_FORM, validateForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token || !attemptSubmit()) {
      return;
    }

    setIsSaving(true);
    try {
      await resetPassword(token, form.password);
      setDone(true);
    } catch (err: unknown) {
      setError(failureMessage(err));
    } finally {
      setIsSaving(false);
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
          {done ? 'Mot de passe modifié' : 'Nouveau mot de passe'}
        </h1>
        <p className="text-sm text-green-600">
          {done
            ? 'Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.'
            : token
              ? 'Choisissez un nouveau mot de passe pour votre compte.'
              : MISSING_TOKEN_MESSAGE}
        </p>
      </div>

      {token && !done && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <div className="relative flex flex-col gap-1.5 text-left">
            <label htmlFor="reset-password" className={LABEL_CLASS}>
              Nouveau mot de passe
            </label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder={minLengthMessage(MIN_LENGTH.password)}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              aria-invalid={isInvalid('password')}
              aria-describedby="reset-password-error"
            />
            <FieldError
              id="reset-password-error"
              message={errorMessage('password')}
            />
          </div>

          <div className="relative flex flex-col gap-1.5 text-left">
            <label htmlFor="reset-confirmation" className={LABEL_CLASS}>
              Confirmer le mot de passe
            </label>
            <Input
              id="reset-confirmation"
              type="password"
              autoComplete="new-password"
              value={form.confirmation}
              onChange={(e) => handleChange('confirmation', e.target.value)}
              onFocus={() => handleFocus('confirmation')}
              onBlur={() => handleBlur('confirmation')}
              aria-invalid={isInvalid('confirmation')}
              aria-describedby="reset-confirmation-error"
            />
            <FieldError
              id="reset-confirmation-error"
              message={errorMessage('confirmation')}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}

      {done ? (
        <Link
          to={PATHS.login}
          className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
        >
          Se connecter
        </Link>
      ) : (
        <Link to={PATHS.forgotPassword} className={LINK_CLASS}>
          Demander un nouveau lien
        </Link>
      )}
    </main>
  );
}
