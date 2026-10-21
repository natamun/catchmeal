import { isToday } from 'date-fns';
import { generatePath } from 'react-router';

import { toApiDate } from '../components/meal/api';
import type { MealType } from '../components/meal/types';
import { PATHS } from './paths';

/** Meal types as they appear in the URL, e.g. /home/add/lunch. */
const MEAL_TYPE_SLUGS: Record<MealType, string> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

const DATE_PARAM = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today's journal has no ?date= so its URL stays /home. */
function withDate(path: string, date: Date) {
  return isToday(date) ? path : `${path}?date=${toApiDate(date)}`;
}

/** URL of the journal for a given day. */
export function journalPath(date: Date) {
  return withDate(PATHS.home, date);
}

/** URL of the page that adds food to one section of the journal. */
export function journalAddPath(mealType: MealType, date: Date) {
  return withDate(
    generatePath(PATHS.journalAdd, { mealType: MEAL_TYPE_SLUGS[mealType] }),
    date,
  );
}

/**
 * Reads the meal type back from the URL, or null for an unknown slug (the page
 * then redirects).
 */
export function mealTypeFromSlug(slug: string | undefined): MealType | null {
  const entry = Object.entries(MEAL_TYPE_SLUGS).find(
    ([, value]) => value === slug,
  );
  return entry ? (entry[0] as MealType) : null;
}

/**
 * Reads ?date=YYYY-MM-DD. A missing or impossible date (2026-02-30) falls back
 * to today.
 */
export function parseDateParam(value: string | null): Date {
  const match = value ? DATE_PARAM.exec(value) : null;
  if (!match) {
    return new Date();
  }

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDate ? date : new Date();
}
