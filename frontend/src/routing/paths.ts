/**
 * Every URL of the app in one place: routes and links use these names instead
 * of raw strings.
 */
export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  legalNotice: '/legal-notice',
  privacy: '/privacy',
  terms: '/terms',
  welcome: '/welcome',
  verifyEmail: '/verify-email',
  home: '/home',
  journalAdd: '/home/add/:mealType',
  food: '/food',
  stats: '/stats',
  friends: '/friends',
  profile: '/profile',
  admin: '/admin',
} as const;
