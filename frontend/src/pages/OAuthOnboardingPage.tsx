import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import * as authApi from '../auth/api';
import { useAuth } from '../auth/authContext';
import { AuthBrandPanel } from '../components/auth/AuthBrandPanel';
import { Brand } from '../components/ui/Brand';
import { FieldError } from '../components/ui/FieldError';
import { LABEL_CLASS } from '../components/ui/fieldStyle';
import { Input } from '../components/ui/Input';
import { useFormValidation } from '../hooks/useFormValidation';
import { requestErrorMessage } from '../utils/requestErrorMessage';
import {
  isValidEmail,
  MAX_LENGTH,
  maxLengthMessage,
  MIN_LENGTH,
  minLengthMessage,
  usernameError,
} from '../utils/validation';

interface Props {
  prefill: {
    username: string;
    name: string;
    email: string;
  };
  onComplete: () => void;
  onBack: () => Promise<void>;
}

interface FormState {
  username: string;
  name: string;
  email: string;
}

const SUBMIT_ERRORS: Record<number, string> = {
  409: "Ce nom d'utilisateur ou cet email est déjà pris.",
};

/** Username 3 to 30 characters, name required, valid email. */
function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const name = form.name.trim();
  const email = form.email.trim();

  const usernameMessage = usernameError(form.username);
  if (usernameMessage) {
    errors.username = usernameMessage;
  }

  if (name === '') {
    errors.name = 'Nom requis';
  } else if (name.length > MAX_LENGTH.name) {
    errors.name = maxLengthMessage(MAX_LENGTH.name);
  }

  if (!isValidEmail(email)) {
    errors.email = 'Email invalide';
  }

  return errors;
}

/**
 * Welcome form of a new OAuth user: they choose a username and confirm their
 * name and email before entering the app.
 */
export function OAuthOnboardingPage({ prefill, onComplete, onBack }: Props) {
  const { updateUser } = useAuth();
  const {
    form,
    handleFocus,
    handleBlur,
    handleChange,
    isInvalid,
    errorMessage,
    attemptSubmit,
  } = useFormValidation<FormState>(
    {
      username: prefill.username,
      name: prefill.name,
      email: prefill.email,
    },
    validate,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!attemptSubmit()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await authApi.completeOAuthProfile({
        username: form.username.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
      });
      updateUser(updated);
      onComplete();
    } catch (err: unknown) {
      setError(
        requestErrorMessage(
          err,
          'Une erreur est survenue, réessayez.',
          SUBMIT_ERRORS,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <AuthBrandPanel />
      <main
        id="main-content"
        className="flex min-h-screen items-center justify-center bg-green-50 px-6 py-8 lg:bg-white"
      >
        <div className="w-full max-w-sm rounded-2xl border border-green-200 bg-white p-6 shadow-sm lg:border-0 lg:p-0 lg:shadow-none">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => void onBack()}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-green-700 transition-colors hover:text-green-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-green-800">
            Bienvenue sur CatchMeal !
          </h1>
          <p className="mb-6 text-sm text-green-600">
            Personnalisez votre profil avant de commencer.
          </p>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            autoComplete="off"
            className="flex flex-col gap-4"
          >
            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="onboarding-username" className={LABEL_CLASS}>
                Nom d'utilisateur
              </label>
              <Input
                id="onboarding-username"
                type="text"
                placeholder={minLengthMessage(MIN_LENGTH.username)}
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onFocus={() => handleFocus('username')}
                onBlur={() => handleBlur('username')}
                aria-invalid={isInvalid('username')}
                aria-describedby="onboarding-username-error"
              />
              <FieldError
                id="onboarding-username-error"
                message={errorMessage('username')}
              />
            </div>

            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="onboarding-name" className={LABEL_CLASS}>
                Nom complet
              </label>
              <Input
                id="onboarding-name"
                type="text"
                placeholder="Prénom et nom"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                aria-invalid={isInvalid('name')}
                aria-describedby="onboarding-name-error"
              />
              <FieldError
                id="onboarding-name-error"
                message={errorMessage('name')}
              />
            </div>

            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="onboarding-email" className={LABEL_CLASS}>
                Adresse e-mail
              </label>
              <Input
                id="onboarding-email"
                type="email"
                placeholder="nom@exemple.ch"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                aria-invalid={isInvalid('email')}
                aria-describedby="onboarding-email-error"
              />
              <FieldError
                id="onboarding-email-error"
                message={errorMessage('email')}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement...' : 'Commencer'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
