import { isSameDay } from 'date-fns';
import { Download } from 'lucide-react';

import type { DashboardDay } from '../../types/dashboard-analytics';
import { formatDayMonth, formatWeekday } from '../../utils/format';
import { toApiDate } from '../meal/api';
import type { DateRange } from '../ui/CalendarButton';
import SummaryCard from '../ui/SummaryCard';

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatPeriod({ from, to }: DateRange) {
  if (isSameDay(from, to)) {
    return formatDayMonth(to);
  }

  return `Du ${formatDayMonth(from)} au ${formatDayMonth(to)}`;
}

function ExportButton({
  label,
  value,
  disabled,
  onClick,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-green-50 px-3 py-1.5 text-left transition-colors hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="min-w-0">
        <span className="block text-xs text-green-600">{label}</span>
        <span className="block font-semibold text-green-800">{value}</span>
      </span>
      <Download
        className="h-4 w-4 shrink-0 text-green-500"
        aria-hidden="true"
      />
    </button>
  );
}

interface Props {
  day: Date;
  dayData: DashboardDay | undefined;
  period: DateRange;
  days: DashboardDay[];
}

export default function DataExport({ day, dayData, period, days }: Props) {
  return (
    <SummaryCard
      title="Exporter mes données"
      aside={<span className="text-sm text-green-600">Format JSON</span>}
    >
      <div className="flex flex-col gap-3">
        <ExportButton
          label="Jour sélectionné"
          value={dayData ? formatWeekday(day) : 'Aucune donnée ce jour'}
          disabled={!dayData}
          onClick={() =>
            downloadJson(dayData, `catchmeal-${toApiDate(day)}.json`)
          }
        />
        <ExportButton
          label="Période affichée"
          value={days.length > 0 ? formatPeriod(period) : 'Aucune donnée'}
          disabled={days.length === 0}
          onClick={() =>
            downloadJson(
              days,
              `catchmeal-${toApiDate(period.from)}_${toApiDate(period.to)}.json`,
            )
          }
        />
      </div>
    </SummaryCard>
  );
}
