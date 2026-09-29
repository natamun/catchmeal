import { z } from 'zod';

const MAX_DAYS = 90;

export function todayInZurich(now: Date = new Date()): string {
  return now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' });
}

const isDay = (day: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(day) &&
  !Number.isNaN(Date.parse(day)) &&
  new Date(day).toISOString().slice(0, 10) === day;

const dayCount = (from: string, to: string): number =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;

const dayString = z
  .string()
  .refine(isDay, 'must be a real date in the format YYYY-MM-DD');

const dateRangeSchema = z
  .object({ from: dayString, to: dayString })
  .refine((r) => !isDay(r.from) || !isDay(r.to) || r.from <= r.to, {
    message: '"from" must not be after "to"',
  })
  .refine(
    (r) => !isDay(r.from) || !isDay(r.to) || dayCount(r.from, r.to) <= MAX_DAYS,
    { message: `the range must not exceed ${MAX_DAYS} days` },
  )
  .refine((r) => !isDay(r.from) || r.from <= todayInZurich(), {
    message: '"from" must not be in the future',
  })
  .transform(({ from, to }) => {
    const now = new Date();
    const today = todayInZurich(now);
    const toDay = to >= today ? today : to;
    return {
      from: new Date(from),
      to: toDay === today ? now : new Date(toDay),
      fromDay: from,
      toDay,
    };
  });

export const getMealsArgs = z.object({ period: dateRangeSchema });
