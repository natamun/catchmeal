import { Link } from 'react-router';

import { Brand } from '../components/ui/Brand';
import { PATHS } from '../routing/paths';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-green-50 px-6 text-center">
      <Brand size="lg" />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-green-800">Page introuvable</h1>
        <p className="text-sm text-green-600">
          Cette page n'existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        to={PATHS.landing}
        className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}
