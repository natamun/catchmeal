import { useState } from 'react';

import * as authApi from '../auth/api';
import { useAuth } from '../auth/auth-context';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import { Brand } from '../components/ui/Brand';
import { FieldError } from '../components/ui/FieldError';
import { Input } from '../components/ui/Input';
import { useTimeout } from '../hooks/useTimeout';
import { requestErrorMessage } from '../utils/requestErrorMessage';

interface Props {
  prefill: {
    username: string;
    name: string;
    email: string;
  };
  onComplete: () => void;
}

interface FormState {
  username: string;
  name: string;
  email: string;
}

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
const MAX_LENGTH = { username: 30, name: 80, email: 255 };

const SUBMIT_ERRORS: Record<number, string> = {
  409: "Ce nom d'utilisateur ou cet email est déjà pris.",
};

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const username = form.username.trim();
  const name = form.name.trim();
  const email = form.email.trim();

  if (username.length < 3) {
    errors.username = 'Au moins 3 caractères';
  } else if (username.length > MAX_LENGTH.username) {
    errors.username = `${MAX_LENGTH.username} caractères maximum`;
  }

  if (name === '') {
    errors.name = 'Nom requis';
  } else if (name.length > MAX_LENGTH.name) {
    errors.name = `${MAX_LENGTH.name} caractères maximum`;
  }

  if (!EMAIL_PATTERN.test(email) || email.length > MAX_LENGTH.email) {
    errors.email = 'Email invalide';
  }

  return errors;
}

export default function OAuthOnboardingPage({ prefill, onComplete }: Props) {
  const { updateUser } = useAuth();
  const [form, setForm] = useState<FormState>({
    username: prefill.username,
    name: prefill.name,
    email: prefill.email,
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});
  const [focusedField, setFocusedField] = useState<keyof FormState | null>(
    null,
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(form);

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const handleFocus = (field: keyof FormState) => setFocusedField(field);

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isInvalid = (field: keyof FormState) =>
    Boolean(touched[field] && errors[field]);

  const errorMessage = (field: keyof FormState) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const allTouched = Object.fromEntries(
      Object.keys(form).map((key) => [key, true]),
    ) as Record<keyof FormState, boolean>;
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
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
                placeholder="3 caractères minimum"
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
