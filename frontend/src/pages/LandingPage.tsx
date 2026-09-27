interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

const FEATURES = [
  {
    title: 'Scan de produits',
    desc: 'Scannez un code-barre et obtenez les informations nutritionnelles instantanément via OpenFoodFacts.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M8 12h8"
        />
      </svg>
    ),
  },
  {
    title: 'Suivi des macros',
    desc: "Calories, protéines, glucides, lipides — visualisez votre apport nutritionnel en un coup d'œil.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: 'Réseau social',
    desc: 'Suivez vos amis, partagez vos progrès et restez motivés ensemble en temps réel.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Assistant nutritionnel',
    desc: 'Des conseils personnalisés basés sur vos repas et vos objectifs, générés par intelligence artificielle.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Créez votre profil',
    desc: 'Renseignez votre poids, votre objectif calorique et vos préférences alimentaires. KcalApp adapte votre suivi en conséquence.',
  },
  {
    number: '02',
    title: 'Scannez vos produits',
    desc: "Pointez votre caméra sur n'importe quel code-barre. Les produits Migros, Coop, Denner, Lidl et des millions d'autres sont reconnus instantanément.",
  },
  {
    number: '03',
    title: 'Suivez votre progression',
    desc: 'Consultez vos statistiques jour après jour — calories, macronutriments, évolution du poids — et ajustez vos habitudes en conséquence.',
  },
];

const SWISS_RETAILERS = [
  { name: 'Migros', note: 'Produits M-Budget, Bio, Sélection' },
  { name: 'Coop', note: 'Gammes Naturaplan, Prix Garantie, Fine Food' },
  { name: 'Denner', note: 'Marques propres et produits discount' },
  { name: 'Lidl Suisse', note: 'Produits frais et marques nationales' },
  { name: 'Aldi Suisse', note: 'Gammes bio et produits du quotidien' },
  { name: 'Manor Food', note: 'Épicerie fine et produits régionaux' },
];

export default function LandingPage({ onLogin, onRegister }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-green-200 px-8 py-4">
        <span className="text-lg font-bold tracking-tight text-green-300">
          KcalApp
        </span>
        <div className="flex items-center gap-2 text-xs text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Suisse
        </div>
        <button
          onClick={onLogin}
          className="cursor-pointer text-sm font-medium text-green-600 transition-colors hover:text-green-300"
        >
          Connexion
        </button>
      </nav>

      {/* Hero */}
      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-8 py-20 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-100 px-3 py-1 text-xs font-medium text-green-400">
            <span
              className="bg-green-1000 inline-block h-1.5 w-1.5 rounded-full"
              aria-hidden="true"
            />
            Conçu et hébergé en Suisse
          </div>
          <h1
            id="hero-title"
            className="mb-4 text-5xl leading-tight font-bold text-green-800 md:text-6xl"
          >
            Prenez le contrôle
            <br />
            <span className="text-green-400">de votre alimentation.</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-green-600">
            Suivez vos calories, scannez vos produits du quotidien et progressez
            avec vos amis. Simple, précis, respectueux de vos données.
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={onRegister}
              className="w-full cursor-pointer rounded-xl bg-green-500 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-green-500"
            >
              Créer un compte
            </button>
            <button
              onClick={onLogin}
              className="w-full cursor-pointer rounded-xl border border-green-200 bg-white py-3 font-semibold text-green-800 transition-colors hover:bg-green-100"
            >
              J'ai déjà un compte
            </button>
          </div>
        </section>

        {/* Comment ça marche */}
        <section
          aria-labelledby="steps-title"
          className="border-y border-green-200 bg-white px-8 py-16"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-xs font-semibold tracking-widest text-green-400 uppercase">
              Comment ça marche
            </p>
            <h2
              id="steps-title"
              className="mb-10 text-3xl font-bold text-green-800"
            >
              Trois étapes pour démarrer
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-3">
                  <span
                    className="text-4xl font-bold text-green-500"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-green-800">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-green-600">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Produits suisses */}
        <section
          aria-labelledby="retailers-title"
          className="mx-auto w-full max-w-6xl px-8 py-16"
        >
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-16">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-green-400 uppercase">
                Base de données
              </p>
              <h2
                id="retailers-title"
                className="mb-4 text-3xl font-bold text-green-800"
              >
                Compatible avec vos courses du quotidien
              </h2>
              <p className="text-sm leading-relaxed text-green-600">
                KcalApp s'appuie sur OpenFoodFacts, une base de données
                collaborative et ouverte qui référence des millions de produits
                alimentaires dans le monde entier — dont une large couverture
                des produits vendus en Suisse. Si un produit n'est pas encore
                répertorié, vous pouvez contribuer à l'enrichir directement
                depuis l'application.
              </p>
              <p className="mt-4 text-xs text-green-600">
                La disponibilité des produits dépend des contributions de la
                communauté OpenFoodFacts. KcalApp n'est pas affilié aux
                enseignes mentionnées.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 md:mt-0">
              {SWISS_RETAILERS.map((r) => (
                <div
                  key={r.name}
                  className="rounded-xl border border-green-200 bg-white p-4 shadow-sm"
                >
                  <p className="mb-1 text-sm font-semibold text-green-800">
                    {r.name}
                  </p>
                  <p className="text-xs text-green-600">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          aria-labelledby="features-title"
          className="border-y border-green-200 bg-white px-8 py-16"
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-xs font-semibold tracking-widest text-green-400 uppercase">
              Fonctionnalités
            </p>
            <h2
              id="features-title"
              className="mb-10 text-3xl font-bold text-green-800"
            >
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-green-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-300">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-green-800">
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-green-600">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Données & confidentialité */}
        <section
          aria-labelledby="privacy-title"
          className="mx-auto w-full max-w-6xl px-8 py-16"
        >
          <div className="md:grid md:grid-cols-2 md:items-start md:gap-16">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-green-400 uppercase">
                Confidentialité
              </p>
              <h2
                id="privacy-title"
                className="mb-4 text-3xl font-bold text-green-800"
              >
                Vos données de santé vous appartiennent
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-green-600">
                Les données que vous enregistrez dans KcalApp — poids, repas,
                objectifs — sont des données de santé. Elles sont stockées en
                Suisse, chiffrées, et ne sont jamais revendues ni partagées avec
                des tiers. Vous pouvez les exporter ou supprimer votre compte à
                tout moment, sans délai.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: 'Hébergement suisse',
                  desc: 'Données stockées sur des serveurs situés en Suisse, soumis à la LPD.',
                },
                {
                  title: 'Conformité RGPD',
                  desc: "Vos droits d'accès, de rectification et de suppression sont garantis.",
                },
                {
                  title: 'Aucune revente',
                  desc: 'Vos données ne sont jamais transmises à des partenaires commerciaux.',
                },
                {
                  title: 'Export à la demande',
                  desc: "Téléchargez l'intégralité de vos données en un clic, à tout moment.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-green-200 bg-white p-4 shadow-sm"
                >
                  <div className="bg-green-1000 mb-3 h-2 w-2 rounded-full" />
                  <h3 className="mb-1 text-sm font-semibold text-green-800">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-green-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section
          aria-labelledby="cta-title"
          className="bg-green-1000 px-8 py-20"
        >
          <div className="mx-auto max-w-6xl text-center">
            <h2 id="cta-title" className="mb-4 text-4xl font-bold text-white">
              Prêt à mieux manger ?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-white/90">
              Rejoignez KcalApp et commencez à suivre votre alimentation dès
              aujourd'hui. Gratuit, sans engagement.
            </p>
            <button
              onClick={onRegister}
              className="cursor-pointer rounded-xl bg-white px-8 py-3 font-semibold text-green-400 shadow-sm transition-colors hover:bg-green-100"
            >
              Créer un compte gratuitement
            </button>
          </div>
        </section>
      </main>

      {/* Footer légal */}
      <footer className="border-t border-green-200 bg-white px-8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap justify-between gap-4 text-xs text-green-600">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">KcalApp</span>
              <span>Suisse — Lausanne</span>
              <span>contact@kcalapp.ch</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">Légal</span>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Conditions d'utilisation
              </a>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Mentions légales
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">Vos données</span>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Exporter mes données
              </a>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Supprimer mon compte
              </a>
              <a
                href="#"
                className="transition-colors hover:text-green-300"
                aria-disabled="true"
              >
                Politique RGPD
              </a>
            </div>
          </div>
          <p className="border-t border-green-200 pt-4 text-xs text-green-600">
            © {new Date().getFullYear()} KcalApp. Vos données de santé sont
            stockées en Suisse et protégées conformément à la loi fédérale sur
            la protection des données (LPD) et au Règlement général sur la
            protection des données (RGPD). KcalApp n'est pas affilié à Migros,
            Coop, Denner, Lidl, Aldi ou Manor.
          </p>
        </div>
      </footer>
    </div>
  );
}
