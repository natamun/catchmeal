interface Props {
  onBack: () => void;
}

export default function ConditionsUtilisationPage({ onBack }: Props) {
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
        <h1 className="mb-10 text-4xl font-bold text-green-800">
          Conditions générales d'utilisation
        </h1>

        {/* Section 1 */}
        <section aria-labelledby="objet-title" className="mb-10">
          <h2
            id="objet-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            1. Objet du service
          </h2>
          <p className="text-sm leading-relaxed text-green-600">
            CatchMeal est une application de suivi nutritionnel et de
            composition corporelle incluant un assistant virtuel basé sur
            l'intelligence artificielle.
          </p>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="avertissement-title" className="mb-10">
          <h2
            id="avertissement-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            2. Avertissement médical et d'assistance IA
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Aucun conseil médical',
                desc: "L'application, ses calculs de composition corporelle (BMR, Katch-McArdle, masse grasse, etc.) et l'assistant IA fournissent des estimations à titre purement indicatif et éducatif.",
              },
              {
                title: 'Modèle de langage (LLM — Mistral AI)',
                desc: "L'assistant IA peut parfois générer des informations inexactes ou imprécises. L'utilisateur ne doit pas s'appuyer sur les réponses de l'IA pour établir un régime médical, traiter un trouble alimentaire ou diagnostiquer une condition médicale.",
              },
              {
                title: 'Consultation professionnelle',
                desc: 'En cas de doute ou de pathologie particulière, consultez un médecin ou un diététicien diplômé.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-green-200 bg-green-50 px-5 py-4"
              >
                <p className="mb-1 text-sm font-semibold text-green-700">
                  {title}
                </p>
                <p className="text-sm leading-relaxed text-green-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="consentement-title" className="mb-10">
          <h2
            id="consentement-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            3. Données de santé et consentement
          </h2>
          <p className="text-sm leading-relaxed text-green-600">
            En créant un compte et en renseignant vos métriques de composition
            corporelle (masse grasse, graisse viscérale, hydratation, etc.),
            vous consentez expressément au traitement de ces données de santé
            sensibles pour le bon fonctionnement des fonctionnalités de
            l'application.
          </p>
        </section>

        {/* Section 4 */}
        <section aria-labelledby="social-title" className="mb-10">
          <h2
            id="social-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            4. Fonctionnalités sociales et communauté
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-green-600">
            Si vous utilisez les fonctionnalités sociales de l'application :
          </p>
          <div className="divide-y divide-green-100 rounded-xl border border-green-200 bg-white">
            {[
              'Vous êtes responsable des informations ou repas que vous choisissez de rendre publics.',
              'Il est strictement interdit de publier du contenu diffamatoire, incitant à des troubles alimentaires ou contraire aux lois suisses.',
            ].map((item, i) => (
              <p
                key={i}
                className="flex gap-3 px-5 py-4 text-sm leading-relaxed text-green-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section aria-labelledby="limitation-title" className="mb-10">
          <h2
            id="limitation-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            5. Limitation de responsabilité
          </h2>
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm leading-relaxed text-green-700">
              En tant que projet étudiant en phase de développement/prototype,
              nous ne garantissons pas la disponibilité ininterrompue du service
              ni l'absence totale de bugs.
            </p>
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
