import { Link } from 'react-router';

import { LEGAL_PAGES } from '../legal/legalPages';
import { Brand } from '../ui/Brand';
import { OpenFoodFactsLink } from '../ui/OpenFoodFactsLink';

export default function PublicFooter() {
  return (
    <footer className="border-t border-green-200 px-8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <Brand />
            <p className="text-sm text-green-600">
              Projet étudiant réalisé à 42 Lausanne.
            </p>
          </div>
          <nav aria-label="Informations légales">
            <ul className="flex flex-col gap-2 text-sm font-medium text-green-700">
              {LEGAL_PAGES.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="transition-colors hover:text-green-500"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="border-t border-green-200 pt-6 text-xs leading-relaxed text-green-600">
          © {new Date().getFullYear()} CatCHMeal. Données produits fournies par{' '}
          <OpenFoodFactsLink />. Ce site n'utilise que les cookies nécessaires à
          votre connexion.
        </p>
      </div>
    </footer>
  );
}
