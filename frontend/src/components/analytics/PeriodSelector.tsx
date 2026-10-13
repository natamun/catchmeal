import {
  addDays,
  differenceInCalendarDays,
  isSameDay,
  subDays,
} from 'date-fns';
import { ArrowRight, CalendarDays } from 'lucide-react';

import CalendarButton, { type DateRange } from '../ui/CalendarButton';
import { PillTabs } from '../ui/PillTabs';
import { lastDays } from './period';

const PRESETS = [
  { value: '7', label: '7 j' },
  { value: '30', label: '30 j' },
  { value: '90', label: '90 j' },
] as const;

const DAYS_AROUND_TODAY = 90;

function formatDay(date: Date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function activePreset({ from, to }: DateRange, today: Date) {
  if (!isSameDay(to, today)) {
    return null;
  }

  const days = String(differenceInCalendarDays(to, from) + 1);

  return PRESETS.find((preset) => preset.value === days)?.value ?? null;
}

interface PeriodSelectorProps {
  period: DateRange;
  onChange: (period: DateRange) => void;
}

export default function PeriodSelector({
  period,
  onChange,
}: PeriodSelectorProps) {
  const today = new Date();

  return (
    <div className="flex flex-wrap justify-between gap-3">
      <CalendarButton
        range={period}
        onRangeChange={onChange}
        min={subDays(today, DAYS_AROUND_TODAY)}
        max={addDays(today, DAYS_AROUND_TODAY)}
        placement="bottom-start"
        className="group flex rounded-xl border border-green-200 bg-white p-1.5 max-xs:w-full"
        wrapperClassName="max-xs:w-full"
      >
        <span className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white tabular-nums transition-colors group-hover:bg-green-600 group-aria-expanded:bg-green-600 max-xs:flex-1 max-xs:justify-center">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isSameDay(period.from, period.to) && (
            <>
              {formatDay(period.from)}
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-green-100"
                aria-hidden="true"
              />
              <span className="sr-only">au</span>
            </>
          )}
          {formatDay(period.to)}
        </span>
      </CalendarButton>
      <PillTabs
        name="statsPeriod"
        options={PRESETS}
        value={activePreset(period, today)}
        onChange={(days) => onChange(lastDays(Number(days)))}
        className="max-xs:w-full max-xs:*:flex-1"
      />
    </div>
  );
}
