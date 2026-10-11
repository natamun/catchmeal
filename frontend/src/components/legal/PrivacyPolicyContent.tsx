export function PrivacyPolicyContent() {
  return (
    <div className="flex flex-col gap-5 text-xs leading-relaxed text-green-600">
      <p className="text-green-500 italic">
        Dernière mise à jour : 11 octobre 2026
      </p>
      <p>
        La présente Politique de confidentialité explique comment nous
        collectons, traitons et protégeons vos données personnelles conformément
        à la Loi fédérale suisse sur la protection des données (nLPD) et aux
        principes du RGPD.
      </p>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          1. Responsables du traitement
        </h3>
        <p>
          Le traitement des données est effectué par l'équipe de développement
          du projet CatCHMeal dans un cadre strictement académique. Contact :{' '}
          <span className="font-semibold text-green-700">
            catchmeal07@gmail.com
          </span>
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          2. Données personnelles collectées
        </h3>
        <p className="mb-2">
          Pour assurer les fonctionnalités de suivi de santé, calcul du
          métabolisme de base et profilage de la composition corporelle, nous
          collectons les données suivantes :
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Données d'identification et de profil :
          </span>{' '}
          Nom d'utilisateur, nom, adresse e-mail, mot de passe (conservé sous
          forme hachée, jamais en clair), photo de profil.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Données de composition corporelle et de santé (données sensibles) :
          </span>{' '}
          Poids et historique des pesées, taille, date de naissance, genre,
          niveau d'activité physique. Masse grasse, masse hors graisse, masse
          musculaire, eau corporelle.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Objectifs et suivi nutritionnel :
          </span>{' '}
          Objectifs quotidiens de calories et de macronutriments (protéines,
          glucides, lipides) et leur historique, poids cible. Aliments et repas
          enregistrés.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Données sociales :
          </span>{' '}
          Liste d'amis et demandes d'amitié, messages privés échangés avec vos
          amis, date de votre dernière connexion.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Interactions avec l'assistant IA :
          </span>{' '}
          Historique des messages et requêtes envoyés au modèle de langage.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Données techniques et métadonnées d'utilisation :
          </span>{' '}
          L'application peut collecter automatiquement des données techniques
          nécessaires au fonctionnement, à la sécurité et au diagnostic du
          service (adresse IP, type d'appareil, version du système
          d'exploitation, version de l'application et journaux d'erreurs/logs).
        </p>
        <p className="mt-2 text-green-500 italic">
          Toute autre donnée personnelle ou technique qui pourrait être
          collectée de manière accessoire ou lors d'évolutions futures de
          l'application demeure strictement soumise aux principes de la présente
          Politique de confidentialité, notamment en matière de sécurité, de
          confidentialité et de limitation des finalités.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          3. Finalités du traitement
        </h3>
        <p className="mb-1">Vos données sont utilisées exclusivement pour :</p>
        <p>
          1. Calculer précisément votre BMR, vos besoins caloriques et vos
          recommandations en macronutriments.
        </p>
        <p>
          2. Afficher l'historique et l'évolution de votre composition
          corporelle sur votre page profil.
        </p>
        <p>
          3. Fournir un contexte personnalisé à l'assistant nutritionnel IA pour
          répondre à vos questions.
        </p>
        <p>4. Tenir votre journal de repas et afficher vos statistiques.</p>
        <p>
          5. Faire fonctionner les fonctions sociales : amis, messagerie et fil
          d'activité.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          4. Informations visibles par vos amis
        </h3>
        <p className="mb-1">
          Les personnes que vous acceptez comme amis voient, dans leur fil
          d'activité :
        </p>
        <p>Les repas que vous enregistrez, avec leur nom et leurs calories.</p>
        <p>Le poids que vous enregistrez, en kilos.</p>
        <p>
          Vos changements d'objectif calorique, les objectifs que vous atteignez
          et vos séries de jours consécutifs.
        </p>
        <p>Votre présence en ligne.</p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          5. Traitement par des tiers et sous-traitants
        </h3>
        <p className="mb-1">
          Pour faire fonctionner l'assistant virtuel, l'application utilise
          l'API de{' '}
          <span className="font-semibold text-green-700">
            Mistral AI (France)
          </span>
          .
        </p>
        <p className="mb-1">
          Lorsque vous interagissez avec l'assistant, les données nécessaires à
          la réponse (votre message, votre profil, vos objectifs, votre
          historique de poids et vos aliments habituels) sont transmises de
          manière sécurisée à Mistral AI.
        </p>
        <p className="mb-1">
          L'historique de la conversation est conservé sur les serveurs de
          Mistral AI. Les données envoyées ne sont pas utilisées pour
          réentraîner des modèles publics.
        </p>
        <p className="mb-2">
          Les données de santé ne sont jamais vendues ni transmises à des fins
          publicitaires ou commerciales.
        </p>
        <p className="mb-1">
          D'autres services interviennent dans le fonctionnement de
          l'application :
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">Supabase :</span>{' '}
          Héberge la base de données et les photos de profil, sur des serveurs
          situés à Francfort (Allemagne).
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Google, GitHub et 42 :
          </span>{' '}
          Si vous choisissez de vous connecter avec l'un de ces comptes, il nous
          transmet votre nom et votre adresse e-mail.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">Mailtrap :</span>{' '}
          Envoie à votre adresse les e-mails de confirmation, lors de l'export
          de vos données ou de la suppression de votre compte.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">Google Fonts :</span>{' '}
          La police d'écriture du site est chargée depuis les serveurs de
          Google, qui reçoivent à cette occasion votre adresse IP.
        </p>
        <p>
          <span className="font-semibold text-green-700">
            Open Food Facts :
          </span>{' '}
          Lorsque vous recherchez un produit par son code-barres, ce code est
          transmis à Open Food Facts par notre serveur, sans aucune donnée vous
          concernant.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          6. Conservation des données
        </h3>
        <p className="mb-1">
          Les données de votre profil et votre historique d'objectifs sont
          conservées tant que votre compte est actif.
        </p>
        <p>
          L'historique de vos conversations avec l'assistant IA n'est pas
          enregistré dans notre base de données : il est conservé par Mistral
          AI. Notre serveur n'en garde qu'un identifiant technique, en mémoire
          vive.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          7. Vos droits (Art. 25 et suivants nLPD)
        </h3>
        <p className="mb-1">
          Vous disposez à tout moment des droits suivants concernant vos données
          :
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Droit d'accès et d'information :
          </span>{' '}
          Connaître les données stockées à votre sujet.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Droit de rectification et de suppression :
          </span>{' '}
          Demander la correction ou la suppression définitive de votre compte et
          de vos données de santé.
        </p>
        <p>
          <span className="font-semibold text-green-700">
            Droit de retrait du consentement :
          </span>{' '}
          Retirer votre consentement au traitement de vos données de santé.
        </p>
      </section>
    </div>
  );
}
