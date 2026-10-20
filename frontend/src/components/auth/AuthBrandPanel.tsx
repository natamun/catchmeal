import { Check } from 'lucide-react';

import { Brand } from '../ui/Brand';

const ARGUMENTS = [
  'Gratuit, sans abonnement ni publicité',
  'Plus de 100 000 produits vendus en Suisse',
  'Un suivi partagé avec vos amis',
];

export function AuthBrandPanel() {
  return (
    <aside className="hidden flex-col justify-between border-r border-green-200 bg-green-50 p-12 lg:flex">
      <Brand size="lg" />
      <div>
        <p className="mb-8 text-4xl leading-tight font-bold text-balance text-green-800 xl:text-5xl">
          Un suivi calorique simple,{' '}
          <span className="text-green-600">pensé pour la Suisse.</span>
        </p>
        <ul className="flex flex-col gap-3 text-green-700">
          {ARGUMENTS.map((argument) => (
            <li key={argument} className="flex items-center gap-3">
              <Check
                className="h-5 w-5 shrink-0 text-green-500"
                aria-hidden="true"
              />
              {argument}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-green-600">
        Créée par des étudiants de 42 Lausanne
      </p>
    </aside>
  );
}
