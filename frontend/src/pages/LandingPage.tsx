import {
  ChartColumn,
  Check,
  Feather,
  Gift,
  LogIn,
  MapPin,
  ScanBarcode,
  Sparkles,
  Users,
  UtensilsCrossed,
  Weight,
} from 'lucide-react';
import { Link } from 'react-router';

import { FeatureCard } from '../components/landing/FeatureCard';
import { LandingSection } from '../components/landing/LandingSection';
import { PhoneMockup } from '../components/landing/PhoneMockup';
import { PublicFooter } from '../components/layout/PublicFooter';
import { PublicHeader } from '../components/layout/PublicHeader';
import { OpenFoodFactsLink } from '../components/ui/OpenFoodFactsLink';
import { PATHS } from '../routing/paths';

/** Header links of the landing page: they scroll to its sections. */
const NAV_LINKS = [
  { label: 'Avantages', id: 'avantages' },
  { label: 'Fonctionnalités', id: 'fonctionnalites' },
  { label: 'À propos', id: 'a-propos' },
].map(({ label, id }) => ({
  label,
  onClick: () => document.getElementById(id)?.scrollIntoView(),
}));

const ADVANTAGES = [
  {
    icon: Gift,
    title: 'Gratuite, vraiment',
    text: "Pas d'abonnement, pas de version premium, pas de publicité. Toutes les fonctions sont ouvertes à tout le monde.",
  },
  {
    icon: MapPin,
    title: 'Pensée pour la Suisse',
    text: (
      <>
        Plus de 100&nbsp;000 produits vendus en Suisse sont référencés grâce à{' '}
        <OpenFoodFactsLink />, une base de données ouverte et collaborative. Un
        produit manque ? Saisissez-le vous-même dans votre liste d'aliments, en
        quelques secondes.
      </>
    ),
  },
  {
    icon: Feather,
    title: 'Simple par choix',
    text: 'Un journal de repas, des objectifs, un suivi de votre composition corporelle et un partage avec vos amis. Rien de superflu.',
  },
];

const FEATURES = [
  {
    icon: ScanBarcode,
    title: 'Scan de code-barres',
    text: "Pointez l'appareil photo de votre téléphone sur un produit : son nom et ses valeurs nutritionnelles se remplissent tout seuls.",
  },
  {
    icon: UtensilsCrossed,
    title: 'Journal de repas',
    text: 'Notez ce que vous mangez jour après jour, et enregistrez vos repas habituels pour les rajouter en un clic.',
  },
  {
    icon: ChartColumn,
    title: 'Objectifs et statistiques',
    text: 'Fixez votre objectif calorique, suivez vos calories et vos macronutriments au fil des semaines.',
  },
  {
    icon: Weight,
    title: 'Poids et composition corporelle',
    text: "Suivez l'évolution de votre poids, de votre masse grasse et de votre masse musculaire. Fixez-vous un poids cible.",
  },
  {
    icon: Users,
    title: 'Entre amis',
    text: 'Ajoutez vos amis, suivez leur activité et discutez avec eux pour rester motivés ensemble.',
  },
  {
    icon: Sparkles,
    title: 'Assistant nutritionnel',
    text: "Posez vos questions à l'assistant IA : il répond en tenant compte de votre profil, de vos objectifs et de votre composition corporelle.",
  },
];

const COMMITMENTS = [
  'Vos données vous appartiennent : exportez-les quand vous voulez.',
  'Supprimez votre compte à tout moment, depuis votre profil.',
  'Aucune publicité, aucune revente de données.',
];

/** Public home page: what the app offers, its features and who made it. */
export function LandingPage() {
  return (
    <div id="landing-page" className="bg-white">
      <PublicHeader
        links={NAV_LINKS}
        action={{ label: 'Connexion', icon: LogIn, to: PATHS.login }}
      />

      <main id="main-content">
        <section
          aria-labelledby="hero-title"
          className="overflow-hidden bg-linear-to-b from-green-50 to-white"
        >
          <div className="mx-auto grid min-h-[calc(100dvh-var(--spacing-header))] w-full max-w-6xl items-center gap-12 px-8 py-12 lg:grid-cols-2 lg:pt-8 lg:pb-28 xl:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"
                  aria-hidden="true"
                />
                Créée par des étudiants de 42 Lausanne
              </div>
              <h1
                id="hero-title"
                className="mb-4 text-4xl leading-tight font-bold text-balance text-green-800 md:text-5xl xl:text-6xl"
              >
                Un suivi calorique simple,{' '}
                <span className="text-green-600">pensé pour la Suisse.</span>
              </h1>
              <p className="mb-8 max-w-md text-base leading-relaxed text-green-600 md:text-lg xl:text-xl">
                Scannez vos produits du quotidien, suivez vos repas et
                motivez-vous entre amis.
              </p>
              <Link
                to={PATHS.register}
                className="inline-block w-full max-w-xs rounded-xl bg-green-500 py-3 text-center font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
              >
                Créer un compte
              </Link>
              <p className="mt-4 text-sm text-green-600">
                Gratuit · Sans publicité · Plus de 100&nbsp;000 produits suisses
              </p>
            </div>
            <PhoneMockup />
          </div>
        </section>

        <LandingSection id="avantages" title="Une app qui va à l'essentiel">
          <div className="grid gap-6 md:grid-cols-3">
            {ADVANTAGES.map(({ icon, title, text }) => (
              <FeatureCard key={title} icon={icon} title={title}>
                {text}
              </FeatureCard>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="fonctionnalites"
          title="Tout ce qu'il faut, rien de plus"
          tinted
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon, title, text }) => (
              <FeatureCard key={title} icon={icon} title={title} inline>
                {text}
              </FeatureCard>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="a-propos"
          title="Faite par des étudiants, pour ses utilisateurs"
        >
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4 leading-relaxed text-green-600">
              <p>
                CatCHMeal est née à l'école 42 Lausanne. Nous cherchions une app
                de suivi calorique simple, gratuite, et qui connaisse les
                produits de nos magasins. Nous ne l'avons pas trouvée, alors
                nous l'avons construite.
              </p>
              <p>
                Nous sommes cinq étudiants, et nous l'avons conçue comme l'app
                que nous voulions utiliser. Elle n'a rien à vendre : ni
                abonnement, ni publicité.
              </p>
            </div>
            <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-green-800">
                Nos engagements
              </h3>
              <ul className="flex flex-col gap-3 text-sm leading-relaxed text-green-600">
                {COMMITMENTS.map((commitment) => (
                  <li key={commitment} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                    {commitment}
                  </li>
                ))}
              </ul>
              <Link
                to={PATHS.privacy}
                className="mt-5 inline-block text-sm font-medium text-green-700 underline underline-offset-2 transition-colors hover:text-green-500"
              >
                Lire la politique de confidentialité
              </Link>
            </div>
          </div>
        </LandingSection>

        <section
          aria-labelledby="cta-title"
          className="bg-green-700 px-8 py-20 text-center"
        >
          <div className="mx-auto max-w-2xl">
            <h2
              id="cta-title"
              className="mb-4 text-3xl font-bold text-white md:text-4xl"
            >
              Prêt à mieux manger ?
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-green-100">
              Créez votre compte et commencez à suivre vos repas dès
              aujourd'hui.
            </p>
            <Link
              to={PATHS.register}
              className="inline-block rounded-xl bg-white px-8 py-3 text-center font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-100"
            >
              Créer un compte
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
