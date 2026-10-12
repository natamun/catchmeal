import { LegalLayout, type LegalPageId } from '../components/legal/LegalLayout';

interface Props {
  onBack: () => void;
  onNavigate: (page: LegalPageId) => void;
}

export default function PrivacyPolicyPage({ onBack, onNavigate }: Props) {
  return (
    <LegalLayout
      current="confidentialite"
      onNavigate={onNavigate}
      onBack={onBack}
    >
      <h1>Politique de confidentialité et RGPD</h1>
      <p className="text-sm text-green-600">
        Dernière mise à jour : 12 octobre 2026
      </p>
      <p>
        La présente Politique de confidentialité explique comment nous
        collectons, traitons et protégeons vos données personnelles conformément
        à la Loi fédérale suisse sur la protection des données (nLPD) et aux
        principes du RGPD.
      </p>

      <h2>1. Responsables du traitement</h2>
      <p>
        Le traitement des données est effectué par l'équipe de développement du
        projet CatCHMeal dans un cadre strictement académique.
      </p>
      <p>
        Contact :{' '}
        <a href="mailto:catchmeal07@gmail.com">catchmeal07@gmail.com</a>
      </p>

      <h2>2. Données personnelles collectées</h2>
      <p>
        Pour assurer les fonctionnalités de suivi de santé, calcul du
        métabolisme de base et profilage de la composition corporelle, nous
        collectons les données suivantes :
      </p>
      <ul>
        <li>
          <strong>Données d'identification et de profil :</strong> Nom
          d'utilisateur, nom, adresse e-mail, mot de passe (conservé sous forme
          hachée, jamais en clair), photo de profil.
        </li>
        <li>
          <strong>
            Données de composition corporelle et de santé (données sensibles) :
          </strong>{' '}
          Poids et historique des pesées, taille, date de naissance, genre,
          niveau d'activité physique. Masse grasse, masse hors graisse, masse
          musculaire, eau corporelle.
        </li>
        <li>
          <strong>Objectifs et suivi nutritionnel :</strong> Objectifs
          quotidiens de calories et de macronutriments (protéines, glucides,
          lipides) et leur historique, poids cible. Aliments et repas
          enregistrés.
        </li>
        <li>
          <strong>Données sociales :</strong> Liste d'amis et demandes d'amitié,
          messages privés échangés avec vos amis, date de votre dernière
          connexion.
        </li>
        <li>
          <strong>Interactions avec l'assistant IA :</strong> Historique des
          messages et requêtes envoyés au modèle de langage.
        </li>
        <li>
          <strong>Données techniques et métadonnées d'utilisation :</strong>{' '}
          L'application peut collecter automatiquement des données techniques
          nécessaires au fonctionnement, à la sécurité et au diagnostic du
          service (adresse IP, type d'appareil, version du système
          d'exploitation, version de l'application et journaux d'erreurs/logs).
        </li>
      </ul>
      <p>
        <em>
          Toute autre donnée personnelle ou technique qui pourrait être
          collectée de manière accessoire ou lors d'évolutions futures de
          l'application demeure strictement soumise aux principes de la présente
          Politique de confidentialité, notamment en matière de sécurité, de
          confidentialité et de limitation des finalités.
        </em>
      </p>

      <h2>3. Finalités du traitement</h2>
      <p>Vos données sont utilisées exclusivement pour :</p>
      <ol>
        <li>
          Calculer précisément votre BMR, vos besoins caloriques et vos
          recommandations en macronutriments.
        </li>
        <li>
          Afficher l'historique et l'évolution de votre composition corporelle
          sur votre page profil.
        </li>
        <li>
          Fournir un contexte personnalisé à l'assistant nutritionnel IA pour
          répondre à vos questions.
        </li>
        <li>Tenir votre journal de repas et afficher vos statistiques.</li>
        <li>
          Faire fonctionner les fonctions sociales : amis, messagerie et fil
          d'activité.
        </li>
      </ol>

      <h2>4. Informations visibles par vos amis</h2>
      <p>
        Les personnes que vous acceptez comme amis voient, dans leur fil
        d'activité :
      </p>
      <ul>
        <li>
          Les repas que vous enregistrez, avec leur nom et leurs calories.
        </li>
        <li>Le poids que vous enregistrez, en kilos.</li>
        <li>
          Vos changements d'objectif calorique, les objectifs que vous atteignez
          et vos séries de jours consécutifs.
        </li>
        <li>Votre présence en ligne.</li>
      </ul>

      <h2>5. Traitement par des tiers et sous-traitants</h2>
      <p>
        Pour faire fonctionner l'assistant virtuel, l'application utilise l'API
        de <strong>Mistral AI (France)</strong>.
      </p>
      <ul>
        <li>
          Lorsque vous interagissez avec l'assistant, les données nécessaires à
          la réponse (votre message, votre profil, vos objectifs, votre
          historique de poids et vos aliments habituels) sont transmises de
          manière sécurisée à Mistral AI.
        </li>
        <li>
          L'historique de la conversation est conservé sur les serveurs de
          Mistral AI. Les données envoyées ne sont pas utilisées pour entraîner
          les modèles de Mistral AI : cette option est désactivée sur notre
          compte.
        </li>
        <li>
          Les données de santé ne sont jamais vendues ni transmises à des fins
          publicitaires ou commerciales.
        </li>
      </ul>
      <p>
        D'autres services interviennent dans le fonctionnement de l'application
        :
      </p>
      <ul>
        <li>
          <strong>Supabase :</strong> Héberge la base de données et les photos
          de profil, sur des serveurs situés à Francfort (Allemagne).
        </li>
        <li>
          <strong>Google, GitHub et 42 :</strong> Si vous choisissez de vous
          connecter avec l'un de ces comptes, il nous transmet votre nom et
          votre adresse e-mail.
        </li>
        <li>
          <strong>Mailtrap :</strong> Envoie à votre adresse les e-mails de
          confirmation, lors de l'export de vos données ou de la suppression de
          votre compte.
        </li>
        <li>
          <strong>Google Fonts :</strong> La police d'écriture du site est
          chargée depuis les serveurs de Google, qui reçoivent à cette occasion
          votre adresse IP.
        </li>
        <li>
          <strong>Open Food Facts :</strong> Lorsque vous recherchez un produit
          par son code-barres, ce code est transmis à Open Food Facts par notre
          serveur, sans aucune donnée vous concernant.
        </li>
      </ul>

      <h2>6. Conservation des données</h2>
      <ul>
        <li>
          Les données de votre profil et votre historique d'objectifs sont
          conservées tant que votre compte est actif.
        </li>
        <li>
          L'historique de vos conversations avec l'assistant IA n'est pas
          enregistré dans notre base de données : il est conservé par Mistral
          AI. Notre serveur n'en garde qu'un identifiant technique, en mémoire
          vive.
        </li>
      </ul>

      <h2>7. Vos droits (Art. 25 et suivants nLPD)</h2>
      <p>
        Vous disposez à tout moment des droits suivants concernant vos données :
      </p>
      <ul>
        <li>
          <strong>Droit d'accès et d'information :</strong> Connaître les
          données stockées à votre sujet.
        </li>
        <li>
          <strong>Droit de rectification et de suppression :</strong> Demander
          la correction ou la suppression définitive de votre compte et de vos
          données de santé.
        </li>
        <li>
          <strong>Droit de retrait du consentement :</strong> Retirer votre
          consentement au traitement de vos données de santé.
        </li>
      </ul>
    </LegalLayout>
  );
}
