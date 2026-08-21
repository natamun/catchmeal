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
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
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
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
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
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
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
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-6xl mx-auto w-full border-b border-green-200">
        <span className="text-lg font-bold text-green-300 tracking-tight">
          KcalApp
        </span>
        <div className="flex items-center gap-2 text-xs text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
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
          className="text-sm font-medium text-green-600 hover:text-green-300 transition-colors cursor-pointer"
        >
          Connexion
        </button>
      </nav>

      {/* Hero */}
      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="flex flex-col items-center justify-center text-center px-8 py-20 max-w-6xl mx-auto w-full"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-100 text-green-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-1000 inline-block"
              aria-hidden="true"
            />
            Conçu et hébergé en Suisse
          </div>
          <h1
            id="hero-title"
            className="text-5xl md:text-6xl font-bold text-green-800 leading-tight mb-4"
          >
            Prenez le contrôle
            <br />
            <span className="text-green-400">de votre alimentation.</span>
          </h1>
          <p className="text-green-600 text-lg mb-8 max-w-xl leading-relaxed">
            Suivez vos calories, scannez vos produits du quotidien et progressez
            avec vos amis. Simple, précis, respectueux de vos données.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={onRegister}
              className="w-full bg-green-500 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Créer un compte
            </button>
            <button
              onClick={onLogin}
              className="w-full bg-white hover:bg-green-100 text-green-800 font-semibold py-3 rounded-xl border border-green-200 transition-colors cursor-pointer"
            >
              J'ai déjà un compte
            </button>
          </div>
        </section>

        {/* Comment ça marche */}
        <section
          aria-labelledby="steps-title"
          className="px-8 py-16 bg-white border-y border-green-200"
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
              Comment ça marche
            </p>
            <h2
              id="steps-title"
              className="text-3xl font-bold text-green-800 mb-10"
            >
              Trois étapes pour démarrer
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-3">
                  <span
                    className="text-4xl font-bold text-green-500"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-green-800">{step.title}</h3>
                  <p className="text-sm text-green-600 leading-relaxed">
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
          className="px-8 py-16 max-w-6xl mx-auto w-full"
        >
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
                Base de données
              </p>
              <h2
                id="retailers-title"
                className="text-3xl font-bold text-green-800 mb-4"
              >
                Compatible avec vos courses du quotidien
              </h2>
              <p className="text-sm text-green-600 leading-relaxed">
                KcalApp s'appuie sur OpenFoodFacts, une base de données
                collaborative et ouverte qui référence des millions de produits
                alimentaires dans le monde entier — dont une large couverture
                des produits vendus en Suisse. Si un produit n'est pas encore
                répertorié, vous pouvez contribuer à l'enrichir directement
                depuis l'application.
              </p>
              <p className="text-xs text-green-600 mt-4">
                La disponibilité des produits dépend des contributions de la
                communauté OpenFoodFacts. KcalApp n'est pas affilié aux
                enseignes mentionnées.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8 md:mt-0">
              {SWISS_RETAILERS.map((r) => (
                <div
                  key={r.name}
                  className="bg-white rounded-xl p-4 border border-green-200 shadow-sm"
                >
                  <p className="font-semibold text-green-800 text-sm mb-1">
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
          className="px-8 py-16 bg-white border-y border-green-200"
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
              Fonctionnalités
            </p>
            <h2
              id="features-title"
              className="text-3xl font-bold text-green-800 mb-10"
            >
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl p-5 border border-green-200 shadow-sm bg-white"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-300 mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2 text-sm">
                    {f.title}
                  </h3>
                  <p className="text-xs text-green-600 leading-relaxed">
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
          className="px-8 py-16 max-w-6xl mx-auto w-full"
        >
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-2">
                Confidentialité
              </p>
              <h2
                id="privacy-title"
                className="text-3xl font-bold text-green-800 mb-4"
              >
                Vos données de santé vous appartiennent
              </h2>
              <p className="text-sm text-green-600 leading-relaxed mb-6">
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
                  className="bg-white rounded-xl p-4 border border-green-200 shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-green-1000 mb-3" />
                  <h3 className="font-semibold text-green-800 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-green-600 leading-relaxed">
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
          className="px-8 py-20 bg-green-1000"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="cta-title" className="text-4xl font-bold text-white mb-4">
              Prêt à mieux manger ?
            </h2>
            <p className="text-white/90 text-base mb-8 max-w-lg mx-auto leading-relaxed">
              Rejoignez KcalApp et commencez à suivre votre alimentation dès
              aujourd'hui. Gratuit, sans engagement.
            </p>
            <button
              onClick={onRegister}
              className="bg-white text-green-400 font-semibold px-8 py-3 rounded-xl hover:bg-green-100 transition-colors cursor-pointer shadow-sm"
            >
              Créer un compte gratuitement
            </button>
          </div>
        </section>
      </main>

      {/* Footer légal */}
      <footer className="border-t border-green-200 bg-white px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap justify-between gap-4 text-xs text-green-600">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">KcalApp</span>
              <span>Suisse — Lausanne</span>
              <span>contact@kcalapp.ch</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">Légal</span>
              <a href="#" className="hover:text-green-300 transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                Mentions légales
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-green-600">Vos données</span>
              <a href="#" className="hover:text-green-300 transition-colors">
                Exporter mes données
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                Supprimer mon compte
              </a>
              <a href="#" className="hover:text-green-300 transition-colors">
                Politique RGPD
              </a>
            </div>
          </div>
          <p className="text-xs text-green-600 border-t border-green-200 pt-4">
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
