import { ChevronLeft, ChevronRight } from 'lucide-react';

import CalendarButton from './CalendarButton';

const ARROW_CLASS =
  'flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-green-500 transition-colors hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400';

function shiftDay(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatLabel(date: Date) {
  const today = new Date();

  if (isSameDay(date, today)) {
    return "Aujourd'hui";
  }
  if (isSameDay(date, shiftDay(today, -1))) {
    return 'Hier';
  }
  if (isSameDay(date, shiftDay(today, 1))) {
    return 'Demain';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

interface DateNavigatorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateNavigator({ value, onChange }: DateNavigatorProps) {
  return (
    <div className="flex gap-1.5 self-start rounded-xl border border-green-200 bg-white p-1.5 max-2xs:w-full">
      <button
        type="button"
        onClick={() => onChange(shiftDay(value, -1))}
        aria-label="Jour précédent"
        className={ARROW_CLASS}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <CalendarButton
        value={value}
        onChange={onChange}
        className="w-36 rounded-lg bg-green-500 px-3 py-1.5 text-center text-sm font-medium text-white capitalize transition-colors hover:bg-green-600 max-2xs:w-full"
        wrapperClassName="max-2xs:flex-1"
      >
        {formatLabel(value)}
      </CalendarButton>
      <button
        type="button"
        onClick={() => onChange(shiftDay(value, 1))}
        aria-label="Jour suivant"
        className={ARROW_CLASS}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
