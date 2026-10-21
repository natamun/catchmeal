import { isSameDay } from 'date-fns';
import { Download } from 'lucide-react';

import { formatDayMonth } from '../../utils/format';
import { toApiDate } from '../meal/api';
import type { DateRange } from '../ui/CalendarButton';
import { SummaryCard } from '../ui/SummaryCard';
import type { DashboardDay } from './types';

/**
 * Makes the browser download `data` as a JSON file, without any request to the
 * server.
 */
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

interface Props {
  period: DateRange;
  days: DashboardDay[];
  isLoading?: boolean;
}

/** Card that downloads the stats of the chosen period as JSON. */
export function DataExport({ period, days, isLoading = false }: Props) {
  const isEmpty = !isLoading && days.length === 0;

  return (
    <SummaryCard
      title="Exporter mes données"
      busy={isLoading}
      aside={<span className="text-sm text-green-600">Format JSON</span>}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-green-800">
          {isEmpty ? 'Aucune donnée' : formatPeriod(period)}
        </p>
        <button
          type="button"
          disabled={isLoading || isEmpty}
          onClick={() =>
            downloadJson(
              days,
              `catchmeal-${toApiDate(period.from)}_${toApiDate(period.to)}.json`,
            )
          }
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 disabled:pointer-events-none disabled:opacity-50 max-xs:w-full"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Télécharger
        </button>
      </div>
    </SummaryCard>
  );
}
