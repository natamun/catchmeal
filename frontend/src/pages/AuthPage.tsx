import { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useMatch, useNavigate } from 'react-router';

import { useAuth } from '../auth/auth-context';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import OAuthButtons from '../components/auth/OAuthButtons';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';
import { TermsOfServiceContent } from '../components/legal/TermsOfServiceContent';
import { BaseDialog } from '../components/ui/BaseDialog';
import { Brand } from '../components/ui/Brand';
import { FieldError } from '../components/ui/FieldError';
import { Input } from '../components/ui/Input';
import { useTimeout } from '../hooks/useTimeout';
import { PATHS } from '../routes';
import { navigationState } from '../routing/navigation';
import { requestErrorMessage } from '../utils/requestErrorMessage';

type Mode = 'login' | 'register';

const OAUTH_ERROR_MESSAGE = 'La connexion a échoué. Réessayez.';

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
const MAX_LENGTH = { username: 30, name: 80, email: 255, password: 72 };
const SUBMIT_ERRORS: Record<number, string> = {
  401: "Nom d'utilisateur ou mot de passe incorrect.",
  409: "Ce nom d'utilisateur ou cet email est déjà pris.",
};

function validateAuthForm(
  mode: Mode,
  form: AuthFormState,
): Partial<Record<keyof AuthFormState, string>> {
  const errors: Partial<Record<keyof AuthFormState, string>> = {};

  const username = form.username.trim();
  const name = form.name.trim();
  const email = form.email.trim();
  const tooLong = (field: keyof AuthFormState, value: string) =>
    mode === 'register' && value.length > MAX_LENGTH[field];

  if (username.length < 3) {
    errors.username = 'Au moins 3 caractères';
  } else if (tooLong('username', username)) {
    errors.username = `${MAX_LENGTH.username} caractères maximum`;
  }

  if (mode === 'register') {
    if (name === '') {
      errors.name = 'Nom requis';
    } else if (tooLong('name', name)) {
      errors.name = `${MAX_LENGTH.name} caractères maximum`;
    }
    if (!EMAIL_PATTERN.test(email) || tooLong('email', email)) {
      errors.email = 'Email invalide';
    }
  }

  if (form.password.length < 8) {
    errors.password = 'Au moins 8 caractères';
  } else if (tooLong('password', form.password)) {
    errors.password = `${MAX_LENGTH.password} caractères maximum`;
  }

  return errors;
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mode: Mode = useMatch(PATHS.register) ? 'register' : 'login';
  const oauthError =
    navigationState(location).oauthFailed === true ? OAUTH_ERROR_MESSAGE : null;
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
    void navigate(nextMode === 'login' ? PATHS.login : PATHS.register, {
      replace: true,
      state: navigationState(location),
    });
    setTouched({});
    setSubmitAttempted(false);
    setError(null);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
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
    <>
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        <AuthBrandPanel />
        <main
          id="main-content"
          className="flex min-h-screen items-center justify-center bg-green-50 px-6 py-8 lg:bg-white"
        >
          <div className="w-full max-w-sm rounded-2xl border border-green-200 bg-white p-6 shadow-sm lg:border-0 lg:p-0 lg:shadow-none">
            <div className="mb-6 flex items-center justify-between">
              <Link
                to={PATHS.landing}
                className="flex items-center gap-2 text-sm font-medium text-green-700 transition-colors hover:text-green-500"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Retour
              </Link>
              <div className="lg:hidden">
                <Brand />
              </div>
            </div>

            <h1 className="mb-6 text-2xl font-bold text-green-800">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
              autoComplete="off"
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className={`relative flex flex-col gap-1.5 ${mode === 'login' ? 'sm:col-span-2' : ''}`}
                >
                  <label htmlFor="auth-username" className={LABEL_CLASS}>
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="auth-username"
                    type="text"
                    placeholder="3 caractères minimum"
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
                  <div className="relative flex flex-col gap-1.5">
                    <label htmlFor="auth-name" className={LABEL_CLASS}>
                      Nom complet
                    </label>
                    <Input
                      id="auth-name"
                      type="text"
                      placeholder="Prénom et nom"
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
                )}
              </div>

              {mode === 'register' && (
                <div className="relative flex flex-col gap-1.5">
                  <label htmlFor="auth-email" className={LABEL_CLASS}>
                    Adresse e-mail
                  </label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="nom@exemple.ch"
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
              )}

              <div className="relative flex flex-col gap-1.5">
                <label htmlFor="auth-password" className={LABEL_CLASS}>
                  Mot de passe
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder={
                    mode === 'login'
                      ? 'Votre mot de passe'
                      : '8 caractères minimum'
                  }
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
              onClick={() =>
                switchMode(mode === 'login' ? 'register' : 'login')
              }
              className="mt-4 w-full cursor-pointer text-center text-sm font-medium text-green-700 transition-colors hover:text-green-500"
            >
              {mode === 'login'
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>

            <div className="my-4 flex items-center gap-3">
              <hr className="flex-1 border-green-200" />
              <span className="text-xs text-green-600">ou continuer avec</span>
              <hr className="flex-1 border-green-200" />
            </div>

            {oauthError && (
              <p className="mb-2 text-sm text-red-500">{oauthError}</p>
            )}

            <OAuthButtons />

            <p className="mt-5 border-t border-green-100 pt-4 text-center text-xs leading-relaxed text-green-600">
              En continuant, vous acceptez nos{' '}
              <button
                type="button"
                onClick={() => conditionsDialogRef.current?.showModal()}
                className="cursor-pointer font-semibold underline underline-offset-2 transition-colors hover:text-green-500"
              >
                Conditions d'utilisation
              </button>{' '}
              et notre{' '}
              <button
                type="button"
                onClick={() => confidentialiteDialogRef.current?.showModal()}
                className="cursor-pointer font-semibold underline underline-offset-2 transition-colors hover:text-green-500"
              >
                Politique de confidentialité
              </button>
              , et vous consentez au traitement de vos données de santé, y
              compris leur transmission à l'assistant IA (Mistral AI).
            </p>
          </div>
        </main>
      </div>

      <BaseDialog
        dialogRef={conditionsDialogRef}
        title="Conditions générales d'utilisation"
        maxWidth="lg"
      >
        <div className="legal-document legal-document-compact">
          <TermsOfServiceContent heading="h3" />
        </div>
      </BaseDialog>

      <BaseDialog
        dialogRef={confidentialiteDialogRef}
        title="Politique de confidentialité et RGPD"
        maxWidth="xl"
      >
        <div className="legal-document legal-document-compact">
          <PrivacyPolicyContent heading="h3" />
        </div>
      </BaseDialog>
    </>
  );
}
