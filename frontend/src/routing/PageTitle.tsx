import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router';

import { LEGAL_PAGES } from '../components/legal/legalPages';
import { MEAL_TYPE_LABELS } from '../components/meal/types';
import { PATHS } from '../routes';
import { mealTypeFromSlug } from './journal';

const APP_NAME = 'CatCHMeal';

const DEFAULT_TITLE = document.title;

const TITLES: Record<string, string> = {
  [PATHS.login]: 'Connexion',
  [PATHS.register]: 'Créer un compte',
  [PATHS.welcome]: 'Bienvenue',
  [PATHS.home]: 'Accueil',
  [PATHS.food]: 'Alimentation',
  [PATHS.stats]: 'Statistiques',
  [PATHS.friends]: 'Amis',
  [PATHS.profile]: 'Profil',
  [PATHS.admin]: 'Administration',
  ...Object.fromEntries(LEGAL_PAGES.map(({ path, label }) => [path, label])),
};

function titleFor(pathname: string) {
  if (pathname === PATHS.landing) {
    return null;
  }

  const journalAdd = matchPath(PATHS.journalAdd, pathname);
  if (journalAdd) {
    const mealType = mealTypeFromSlug(journalAdd.params.mealType);
    return mealType ? `Ajouter : ${MEAL_TYPE_LABELS[mealType]}` : null;
  }

  return TITLES[pathname] ?? 'Page introuvable';
}

export function PageTitle() {
  const { pathname } = useLocation();
  const title = titleFor(pathname);

  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : DEFAULT_TITLE;
  }, [title]);

  return null;
}
