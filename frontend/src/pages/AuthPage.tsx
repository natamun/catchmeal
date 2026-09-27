import { useState, type FormEvent } from 'react';

import { ApiError } from '../auth/api';
import { useAuth } from '../auth/auth-context';
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
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
          }}
          className="mt-2 w-full cursor-pointer rounded-xl border border-green-200 bg-white px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}
