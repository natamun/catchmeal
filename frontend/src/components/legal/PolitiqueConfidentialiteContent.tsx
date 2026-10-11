export function PolitiqueConfidentialiteContent() {
  return (
    <div className="flex flex-col gap-5 text-xs leading-relaxed text-green-600">
      <p className="text-green-500 italic">
        Dernière mise à jour : 9 octobre 2026
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
          du projet CatchMeal dans un cadre strictement académique. Contact :{' '}
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
          Nom d'utilisateur, adresse e-mail.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Données de composition corporelle et de santé (données sensibles) :
          </span>{' '}
          Masse grasse, masse musculaire, masse hors graisse, graisse
          sous-cutanée, graisse viscérale, eau corporelle, masse osseuse,
          protéines, âge métabolique.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-green-700">
            Objectifs et suivi nutritionnel (GoalSetting) :
          </span>{' '}
          Historique et objectifs quotidiens de macronutriments (dailyProtein,
          dailyCarbs, dailyFat). Suivi des repas enregistrés et consommation
          d'eau.
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
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          4. Traitement par des tiers et sous-traitants (Mistral AI)
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
          la réponse (votre message, vos objectifs de macros et paramètres
          corporels pertinents) sont transmises de manière sécurisée à Mistral
          AI.
        </p>
        <p className="mb-1">
          Les données envoyées ne sont pas conservées de manière permanente par
          l'assistant et ne sont pas utilisées pour réentraîner des modèles
          publics.
        </p>
        <p>
          Les données de santé ne sont jamais vendues ni transmises à des fins
          publicitaires ou commerciales.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          5. Conservation des données
        </h3>
        <p className="mb-1">
          Les données de votre profil et votre historique d'objectifs
          (GoalSetting) sont conservées tant que votre compte est actif.
        </p>
        <p>
          Le contexte des conversations du chat IA est stocké temporairement en
          mémoire vive sur le serveur backend et est réinitialisé régulièrement.
        </p>
      </section>

      <section>
        <h3 className="mb-1 text-sm font-semibold text-green-800">
          6. Vos droits (Art. 25 et suivants nLPD)
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
