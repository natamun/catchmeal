interface Props {
  onBack: () => void;
}

export default function MentionsLegalesPage({ onBack }: Props) {
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
          Mentions légales
        </h1>

        {/* Section 1 */}
        <section aria-labelledby="editeur-title" className="mb-10">
          <h2
            id="editeur-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            1. Éditeur du service
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-green-600">
            Ce service web et mobile est développé dans le cadre d'un projet
            académique et éducatif non commercial.
          </p>
          <div className="divide-y divide-green-100 rounded-xl border border-green-200 bg-white">
            {[
              { label: 'Nom du projet', value: 'CatchMeal' },
              {
                label: 'Équipe de développement',
                value:
                  'Natalino Munari, Maxime Martin, Seully Trieste, Curtis Bezençon et Diana Ramirez',
              },
              {
                label: "Établissement d'enseignement",
                value: '42 Lausanne',
              },
              { label: 'Contact', value: 'catchmeal07@gmail.com' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              >
                <span className="shrink-0 text-sm font-semibold text-green-700">
                  {label}
                </span>
                <span className="text-sm text-green-600 sm:text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="hebergement-title" className="mb-10">
          <h2
            id="hebergement-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            2. Hébergement
          </h2>
          <p className="text-sm leading-relaxed text-green-600">
            Le service et ses bases de données sont hébergés sur{' '}
            <span className="font-semibold text-green-700">Supabase</span>{' '}
            (serveurs situés en Suisse).
          </p>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="propriete-title" className="mb-10">
          <h2
            id="propriete-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            3. Propriété intellectuelle
          </h2>
          <p className="text-sm leading-relaxed text-green-600">
            L'ensemble des contenus, logos, interfaces et codes sources
            développés dans le cadre de ce projet sont la propriété exclusive de
            l'équipe de développement, sauf mention contraire.
          </p>
        </section>

        {/* Section 4 */}
        <section aria-labelledby="responsabilite-title" className="mb-10">
          <h2
            id="responsabilite-title"
            className="mb-4 text-xl font-semibold text-green-800"
          >
            4. Non-responsabilité médicale
          </h2>
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm leading-relaxed text-green-700">
              Cette application est un outil informatique d'aide au suivi
              personnel et ne constitue en aucun cas un dispositif médical ni un
              service de conseil médical ou diététique.
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
