import { useState, type FormEvent } from 'react';

import { ApiError } from '../auth/api';
import { useAuth } from '../auth/auth-context';
import { Input } from '../components/ui/Input';

interface Props {
  onCancel: () => void;
}

export default function AdminLoginPage({ onCancel }: Props) {
  const { loginAsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginAsAdmin({ username, password });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Une erreur est survenue.',
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

        <h1 className="mb-2 text-xl font-bold text-green-800">
          Admin — Connexion
        </h1>
        <p className="mb-6 text-sm text-green-500">
          Accès réservé aux administrateurs.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-username"
              className="text-xs font-semibold tracking-wide text-green-500 uppercase"
            >
              Nom d'utilisateur
            </label>
            <Input
              id="admin-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold tracking-wide text-green-500 uppercase"
            >
              Mot de passe
            </label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Chargement...' : 'Connexion Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
