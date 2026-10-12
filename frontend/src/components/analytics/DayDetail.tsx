import { MACROS } from '../../constants/macros';
import type { DashboardDay } from '../../types/dashboard-analytics';
import { formatKg } from '../../utils/format';
import type { DateRange } from '../ui/CalendarButton';
import DateNavigator from '../ui/DateNavigator';
import Skeleton from '../ui/Skeleton';
import StatTile from '../ui/StatTile';
import SummaryCard from '../ui/SummaryCard';
import { MACRO_TOTAL_KEYS } from './macroSeries';

function rounded(value: number | null | undefined, unit: string) {
  return typeof value === 'number' ? `${Math.round(value)} ${unit}` : '–';
}

interface Props {
  day: Date;
  onDayChange: (day: Date) => void;
  period: DateRange;
  data: DashboardDay | undefined;
  isLoading?: boolean;
  className?: string;
}

export default function DayDetail({
  day,
  onDayChange,
  period,
  data,
  isLoading = false,
  className,
}: Props) {
  const value = (text: string) =>
    isLoading ? <Skeleton className="h-6 w-14" /> : text;

  return (
    <SummaryCard
      title="Détail du jour"
      busy={isLoading}
      className={className}
      aside={
        <div className="max-2xs:w-full lg:-my-1.5">
          <DateNavigator
            value={day}
            onChange={onDayChange}
            min={period.from}
            max={period.to}
            framed={false}
          />
        </div>
      }
    >
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Calories">
          {value(rounded(data?.totalKcal, 'kcal'))}
        </StatTile>
        <StatTile label="Objectif">
          {value(rounded(data?.goalKcal, 'kcal'))}
        </StatTile>
        <StatTile label="Poids">
          {value(
            typeof data?.weight === 'number'
              ? `${formatKg(data.weight)} kg`
              : '–',
          )}
        </StatTile>
        {MACROS.map(({ key, label }) => (
          <StatTile key={key} label={label}>
            {value(rounded(data?.[MACRO_TOTAL_KEYS[key]], 'g'))}
          </StatTile>
        ))}
      </dl>
    </SummaryCard>
  );
}
