import { PATHS } from '../../routing/paths';

/** The three legal pages, used by the footer links and the tab titles. */
export const LEGAL_PAGES = [
  {
    path: PATHS.privacy,
    label: 'Politique de confidentialité',
    shortLabel: 'Confidentialité',
  },
  {
    path: PATHS.terms,
    label: "Conditions d'utilisation",
    shortLabel: 'Conditions',
  },
  {
    path: PATHS.legalNotice,
    label: 'Mentions légales',
    shortLabel: 'Mentions légales',
  },
];
