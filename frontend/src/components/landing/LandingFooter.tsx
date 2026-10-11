import Brand from './Brand';
import OpenFoodFactsLink from './OpenFoodFactsLink';

interface Props {
  onMentionsLegales: () => void;
  onConfidentialite: () => void;
  onConditions: () => void;
}

export default function LandingFooter({
  onMentionsLegales,
  onConfidentialite,
  onConditions,
}: Props) {
  const legalLinks = [
    { label: 'Politique de confidentialité', onClick: onConfidentialite },
    { label: "Conditions d'utilisation", onClick: onConditions },
    { label: 'Mentions légales', onClick: onMentionsLegales },
  ];

  return (
    <footer className="px-8 py-10">
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
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={link.onClick}
                    className="cursor-pointer transition-colors hover:text-green-500"
                  >
                    {link.label}
                  </button>
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
