import { subDays } from 'date-fns';

import type { DateRange } from '../ui/CalendarButton';

export function lastDays(days: number): DateRange {
  const to = new Date();

  return { from: subDays(to, days - 1), to };
}
