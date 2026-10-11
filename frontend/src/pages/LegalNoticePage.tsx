import { LegalLayout, type LegalPageId } from '../components/legal/LegalLayout';

interface Props {
  onBack: () => void;
  onNavigate: (page: LegalPageId) => void;
}

export default function LegalNoticePage({ onBack, onNavigate }: Props) {
  return (
    <LegalLayout
      current="mentions-legales"
      onNavigate={onNavigate}
      onBack={onBack}
    >
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
          <strong>Équipe de développement :</strong> Natalino Munari, Maxime
          Martin, Seully Trieste, Curtis Bezençon et Diana Ramirez
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
        L'ensemble des contenus, logos, interfaces et codes sources développés
        dans le cadre de ce projet sont la propriété exclusive de l'équipe de
        développement, sauf mention contraire.
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
