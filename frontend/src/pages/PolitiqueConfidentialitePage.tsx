interface Props {
  onBack: () => void;
}

export default function PolitiqueConfidentialitePage({ onBack }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-green-200 px-8 py-4">
        <span className="text-lg font-bold tracking-tight text-green-700">
          KcalApp
        </span>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-sm font-medium text-green-600 transition-colors hover:text-green-300"
        >
          ← Retour
        </button>
      </nav>

      {/* Content */}
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-8 py-16"
      >
        <h1 className="mb-2 text-4xl font-bold text-green-800">
          Politique de confidentialité et RGPD
        </h1>
        <p className="mb-10 text-xs text-green-500">
          Dernière mise à jour : 9 octobre 2026
        </p>
        <p className="mb-10 text-sm leading-relaxed text-green-600">
          La présente Politique de confidentialité explique comment nous
          collectons, traitons et protégeons vos données personnelles
          conformément à la Loi fédérale suisse sur la protection des données
          (nLPD) et aux principes du RGPD.
        </p>

        {/* Section 1 */}
        <section aria-labelledby="responsables-title" className="mb-10">
          <h2
            id="responsables-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            1. Responsables du traitement
          </h2>
          <p className="text-sm leading-relaxed text-green-600">
            Le traitement des données est effectué par l'équipe de développement
            du projet CatchMeal dans un cadre strictement académique.
          </p>
          <p className="mt-2 text-sm text-green-600">
            Contact :{' '}
            <span className="font-semibold text-green-700">
              catchmeal07@gmail.com
            </span>
          </p>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="donnees-title" className="mb-10">
          <h2
            id="donnees-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            2. Données personnelles collectées
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-green-600">
            Pour assurer les fonctionnalités de suivi de santé, calcul du
            métabolisme de base et profilage de la composition corporelle, nous
            collectons les données suivantes :
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                title: 'Données d\u2019identification et de profil',
                content: "Nom d'utilisateur, adresse e-mail.",
              },
              {
                title:
                  'Données de composition corporelle et de santé (données sensibles)',
                content:
                  'Masse grasse, masse musculaire, masse hors graisse. Graisse sous-cutanée, graisse viscérale. Eau corporelle, masse osseuse, protéines, âge métabolique.',
              },
              {
                title: 'Objectifs et suivi nutritionnel (GoalSetting)',
                content:
                  "Historique et objectifs quotidiens de macronutriments (dailyProtein, dailyCarbs, dailyFat). Suivi des repas enregistrés et consommation d'eau.",
              },
              {
                title: "Interactions avec l'assistant IA",
                content:
                  'Historique des messages et requêtes envoyés au modèle de langage.',
              },
              {
                title: "Données techniques et métadonnées d'utilisation",
                content:
                  "L'application peut collecter automatiquement des données techniques nécessaires au fonctionnement, à la sécurité et au diagnostic du service (adresse IP, type d'appareil, version du système d'exploitation, version de l'application et journaux d'erreurs/logs).",
              },
            ].map(({ title, content }) => (
              <div
                key={title}
                className="rounded-xl border border-green-200 bg-white px-5 py-4"
              >
                <p className="mb-1 text-sm font-semibold text-green-700">
                  {title}
                </p>
                <p className="text-sm leading-relaxed text-green-600">
                  {content}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-green-500 italic">
            Toute autre donnée personnelle ou technique qui pourrait être
            collectée de manière accessoire ou lors d'évolutions futures de
            l'application demeure strictement soumise aux principes de la
            présente Politique de confidentialité, notamment en matière de
            sécurité, de confidentialité et de limitation des finalités.
          </p>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="finalites-title" className="mb-10">
          <h2
            id="finalites-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            3. Finalités du traitement
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-green-600">
            Vos données sont utilisées exclusivement pour :
          </p>
          <ol className="flex flex-col gap-2 pl-4">
            {[
              'Calculer précisément votre BMR, vos besoins caloriques et vos recommandations en macronutriments.',
              "Afficher l'historique et l'évolution de votre composition corporelle sur votre page profil.",
              "Fournir un contexte personnalisé à l'assistant nutritionnel IA pour répondre à vos questions.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm leading-relaxed text-green-600"
              >
                <span className="shrink-0 font-semibold text-green-500">
                  {i + 1}.
                </span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        {/* Section 4 */}
        <section aria-labelledby="tiers-title" className="mb-10">
          <h2
            id="tiers-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            4. Traitement par des tiers et sous-traitants (Mistral AI)
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-green-600">
            Pour faire fonctionner l'assistant virtuel, l'application utilise
            l'API de{' '}
            <span className="font-semibold text-green-700">
              Mistral AI (France)
            </span>
            .
          </p>
          <div className="flex flex-col gap-2 rounded-xl border border-green-200 bg-white px-5 py-4">
            {[
              "Lorsque vous interagissez avec l'assistant, les données nécessaires à la réponse (votre message, vos objectifs de macros et paramètres corporels pertinents) sont transmises de manière sécurisée à Mistral AI.",
              "Les données envoyées ne sont pas conservées de manière permanente par l'assistant et ne sont pas utilisées pour réentraîner des modèles publics.",
              'Les données de santé ne sont jamais vendues ni transmises à des fins publicitaires ou commerciales.',
            ].map((item, i) => (
              <p key={i} className="text-sm leading-relaxed text-green-600">
                — {item}
              </p>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section aria-labelledby="conservation-title" className="mb-10">
          <h2
            id="conservation-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            5. Conservation des données
          </h2>
          <div className="flex flex-col gap-2">
            {[
              "Les données de votre profil et votre historique d'objectifs (GoalSetting) sont conservées tant que votre compte est actif.",
              'Le contexte des conversations du chat IA est stocké temporairement en mémoire vive sur le serveur backend et est réinitialisé régulièrement.',
            ].map((item, i) => (
              <p
                key={i}
                className="flex gap-3 text-sm leading-relaxed text-green-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Section 6 */}
        <section aria-labelledby="droits-title" className="mb-10">
          <h2
            id="droits-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            6. Vos droits (Art. 25 et suivants nLPD)
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-green-600">
            Vous disposez à tout moment des droits suivants concernant vos
            données :
          </p>
          <div className="divide-y divide-green-100 rounded-xl border border-green-200 bg-white">
            {[
              {
                title: "Droit d'accès et d'information",
                desc: 'Connaître les données stockées à votre sujet.',
              },
              {
                title: 'Droit de rectification et de suppression',
                desc: 'Demander la correction ou la suppression définitive de votre compte et de vos données de santé.',
              },
              {
                title: 'Droit de retrait du consentement',
                desc: 'Retirer votre consentement au traitement de vos données de santé.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="px-5 py-4">
                <p className="mb-1 text-sm font-semibold text-green-700">
                  {title}
                </p>
                <p className="text-sm leading-relaxed text-green-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-green-200 bg-white px-8 py-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs text-green-600">
            © {new Date().getFullYear()} KcalApp — Projet académique 42
            Lausanne.
          </p>
        </div>
      </footer>
    </div>
  );
}
