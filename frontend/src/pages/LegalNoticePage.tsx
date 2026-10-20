import { Fragment } from 'react';

import { LegalLayout } from '../components/legal/LegalLayout';

const TEAM = [
  { name: 'Natalino Munari', url: 'https://github.com/natamun' },
  {
    name: 'Maxime Martin',
    url: 'https://www.linkedin.com/in/maxime-martin-090731aa',
  },
  {
    name: 'Seully Trieste',
    url: 'https://www.linkedin.com/in/seully-trieste-dev/',
  },
  { name: 'Curtis Bezençon', url: 'https://github.com/CurtXY' },
  {
    name: 'Diana Ramirez',
    url: 'https://www.linkedin.com/in/dianaramirezcarrillo',
  },
];

export default function LegalNoticePage() {
  return (
    <LegalLayout>
      <h1>Mentions légales</h1>

      <h2>1. Éditeur du service</h2>
      <p>
        Ce service web et mobile est développé dans le cadre d'un projet
        académique et éducatif non commercial.
      </p>
      <ul>
        <li>
          <strong>Nom du projet :</strong> CatCHMeal
        </li>
        <li>
          <strong>Équipe de développement :</strong>{' '}
          {TEAM.map(({ name, url }, index) => (
            <Fragment key={name}>
              {index > 0 && (index === TEAM.length - 1 ? ' et ' : ', ')}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            </Fragment>
          ))}
        </li>
        <li>
          <strong>Établissement d'enseignement :</strong> 42 Lausanne
        </li>
        <li>
          <strong>Contact :</strong>{' '}
          <a href="mailto:catchmeal07@gmail.com">catchmeal07@gmail.com</a>
        </li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>
        La base de données et les photos de profil sont hébergées par{' '}
        <strong>Supabase</strong> sur des serveurs situés à Francfort
        (Allemagne).
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Les contenus, les interfaces et le code source développés dans le cadre
        de ce projet sont la propriété de l'équipe de développement, sauf
        mention contraire.
      </p>
      <p>
        Les icônes de l'interface proviennent de la bibliothèque Lucide,
        distribuée sous licence ISC. Les autres bibliothèques tierces utilisées
        restent la propriété de leurs auteurs et sont soumises à leurs licences
        respectives.
      </p>

      <h2>4. Non-responsabilité médicale</h2>
      <p>
        Cette application est un outil informatique d'aide au suivi personnel et
        ne constitue en aucun cas un dispositif médical ni un service de conseil
        médical ou diététique.
      </p>
    </LegalLayout>
  );
}
