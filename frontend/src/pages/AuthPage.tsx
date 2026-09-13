import { useState, type FormEvent } from 'react';

import { ApiError } from '../auth/api';
import { useAuth } from '../auth/auth-context';
import { Input } from '../components/ui/Input';

type Mode = 'login' | 'register';

interface Props {
  initialMode: Mode;
  onCancel: () => void;
}

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

export default function AuthPage({ initialMode, onCancel }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ username, password });
      } else {
        await register({ username, name, email, password });
      }
    } catch (err: unknown) {
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
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-username" className={LABEL_CLASS}>
              Nom d'utilisateur
            </label>
            <Input
              id="auth-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-name" className={LABEL_CLASS}>
                  Nom complet
                </label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-email" className={LABEL_CLASS}>
                  Email
                </label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className={LABEL_CLASS}>
              Mot de passe
            </label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="mt-4 w-full cursor-pointer text-center text-sm text-green-500 hover:text-green-600"
        >
          {mode === 'login'
            ? "Pas encore de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}
