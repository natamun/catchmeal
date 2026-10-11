import { useRef, useState, type FormEvent } from 'react';

import { ApiError } from '../auth/api';
import { useAuth } from '../auth/auth-context';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';
import { TermsOfServiceContent } from '../components/legal/TermsOfServiceContent';
import { BaseDialog } from '../components/ui/BaseDialog';
import { FieldError } from '../components/ui/FieldError';
import { Input } from '../components/ui/Input';
import { useTimeout } from '../hooks/useTimeout';

type Mode = 'login' | 'register';

interface Props {
  initialMode: Mode;
  onCancel: () => void;
  oauthError?: string | null;
}

interface AuthFormState {
  username: string;
  name: string;
  email: string;
  password: string;
}

const EMPTY_FORM: AuthFormState = {
  username: '',
  name: '',
  email: '',
  password: '',
};

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateAuthForm(
  mode: Mode,
  form: AuthFormState,
): Partial<Record<keyof AuthFormState, string>> {
  const errors: Partial<Record<keyof AuthFormState, string>> = {};

  if (form.username.trim().length < 3) {
    errors.username = 'Au moins 3 caractères';
  }

  if (mode === 'register') {
    if (form.name.trim() === '') {
      errors.name = 'Nom requis';
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      errors.email = 'Email invalide';
    }
  }

  if (form.password.length < 8) {
    errors.password = 'Au moins 8 caractères';
  }

  return errors;
}

export default function AuthPage({ initialMode, onCancel, oauthError }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState<AuthFormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof AuthFormState, boolean>>
  >({});
  const [focusedField, setFocusedField] = useState<keyof AuthFormState | null>(
    null,
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const conditionsDialogRef = useRef<HTMLDialogElement>(null);
  const confidentialiteDialogRef = useRef<HTMLDialogElement>(null);

  const errors = validateAuthForm(mode, form);

  useTimeout(() => setSubmitAttempted(false), submitAttempted ? 5000 : null);

  const handleFocus = (field: keyof AuthFormState) => setFocusedField(field);

  const handleBlur = (field: keyof AuthFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFocusedField((current) => (current === field ? null : current));
  };

  const handleChange = (field: keyof AuthFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isInvalid = (field: keyof AuthFormState) =>
    Boolean(touched[field] && errors[field]);

  const errorMessage = (field: keyof AuthFormState) =>
    touched[field] && (focusedField === field || submitAttempted)
      ? errors[field]
      : undefined;

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setTouched({});
    setSubmitAttempted(false);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const allTouched = Object.fromEntries(
      Object.keys(form).map((key) => [key, true]),
    ) as Record<keyof AuthFormState, boolean>;
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setSubmitAttempted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ username: form.username, password: form.password });
      } else {
        await register({
          username: form.username,
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Une erreur est survenue, réessaye.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-green-50 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 cursor-pointer text-sm text-green-500 hover:text-green-600"
          >
            ← Retour
          </button>

          <h1 className="mb-6 text-xl font-bold text-green-800">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
            autoComplete="off"
            className="flex flex-col gap-4"
          >
            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="auth-username" className={LABEL_CLASS}>
                Nom d'utilisateur
              </label>
              <Input
                id="auth-username"
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onFocus={() => handleFocus('username')}
                onBlur={() => handleBlur('username')}
                aria-invalid={isInvalid('username')}
                aria-describedby="auth-username-error"
              />
              <FieldError
                id="auth-username-error"
                message={errorMessage('username')}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="relative flex flex-col gap-1.5">
                  <label htmlFor="auth-name" className={LABEL_CLASS}>
                    Nom complet
                  </label>
                  <Input
                    id="auth-name"
                    type="text"
                    placeholder="Nom complet"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onFocus={() => handleFocus('name')}
                    onBlur={() => handleBlur('name')}
                    aria-invalid={isInvalid('name')}
                    aria-describedby="auth-name-error"
                  />
                  <FieldError
                    id="auth-name-error"
                    message={errorMessage('name')}
                  />
                </div>
                <div className="relative flex flex-col gap-1.5">
                  <label htmlFor="auth-email" className={LABEL_CLASS}>
                    Email
                  </label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={isInvalid('email')}
                    aria-describedby="auth-email-error"
                  />
                  <FieldError
                    id="auth-email-error"
                    message={errorMessage('email')}
                  />
                </div>
              </>
            )}

            <div className="relative flex flex-col gap-1.5">
              <label htmlFor="auth-password" className={LABEL_CLASS}>
                Mot de passe
              </label>
              <Input
                id="auth-password"
                type="password"
                placeholder="8 caractères minimum"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                aria-invalid={isInvalid('password')}
                aria-describedby="auth-password-error"
              />
              <FieldError
                id="auth-password-error"
                message={errorMessage('password')}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Chargement...'
                : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="mt-4 w-full cursor-pointer text-center text-sm text-green-500 hover:text-green-600"
          >
            {mode === 'login'
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <hr className="flex-1 border-green-200" />
            <span className="text-xs text-green-400">ou</span>
            <hr className="flex-1 border-green-200" />
          </div>

          {oauthError && (
            <p className="mt-2 text-sm text-red-500">{oauthError}</p>
          )}

          <button
            type="button"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
            }}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Login with Google
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
            }}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Login with GitHub
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_URL}/auth/42`;
            }}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-sm font-black text-green-700"
              aria-hidden="true"
            >
              42
            </span>
            Login with 42
          </button>

          <div className="mt-5 flex flex-col gap-2 border-t border-green-100 pt-4 text-center text-xs leading-relaxed text-green-500">
            <p>
              En vous inscrivant ou en vous connectant via un mode
              d'authentification, vous acceptez nos{' '}
              <button
                type="button"
                onClick={() => conditionsDialogRef.current?.showModal()}
                className="cursor-pointer font-semibold underline underline-offset-2 hover:text-green-400"
              >
                Conditions d'utilisation
              </button>{' '}
              et la{' '}
              <button
                type="button"
                onClick={() => confidentialiteDialogRef.current?.showModal()}
                className="cursor-pointer font-semibold underline underline-offset-2 hover:text-green-400"
              >
                Politique de confidentialité et RGPD
              </button>
              .
            </p>
            <p>
              Vous consentez expressément au traitement de vos données de santé
              et de composition corporelle ainsi qu'à leur transmission
              sécurisée à l'assistant IA (Mistral AI) pour l'analyse de votre
              profil et le calcul de vos besoins nutritionnels.
            </p>
          </div>
        </div>
      </div>

      <BaseDialog
        dialogRef={conditionsDialogRef}
        title="Conditions générales d'utilisation"
        maxWidth="lg"
      >
        <TermsOfServiceContent />
      </BaseDialog>

      <BaseDialog
        dialogRef={confidentialiteDialogRef}
        title="Politique de confidentialité et RGPD"
        maxWidth="xl"
      >
        <PrivacyPolicyContent />
      </BaseDialog>
    </>
  );
}
