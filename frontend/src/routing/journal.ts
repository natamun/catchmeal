import { isToday } from 'date-fns';
import { generatePath } from 'react-router';

import { toApiDate } from '../components/meal/api';
import type { MealType } from '../components/meal/types';
import { PATHS } from './paths';

const MEAL_TYPE_SLUGS: Record<MealType, string> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

const DATE_PARAM = /^(\d{4})-(\d{2})-(\d{2})$/;

function withDate(path: string, date: Date) {
  return isToday(date) ? path : `${path}?date=${toApiDate(date)}`;
}

export function journalPath(date: Date) {
  return withDate(PATHS.home, date);
}

export function journalAddPath(mealType: MealType, date: Date) {
  return withDate(
    generatePath(PATHS.journalAdd, { mealType: MEAL_TYPE_SLUGS[mealType] }),
    date,
  );
}

export function mealTypeFromSlug(slug: string | undefined): MealType | null {
  const entry = Object.entries(MEAL_TYPE_SLUGS).find(
    ([, value]) => value === slug,
  );
  return entry ? (entry[0] as MealType) : null;
}

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
