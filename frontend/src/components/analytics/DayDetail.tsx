import { MACROS } from '../../constants/macros';
import type { DashboardDay } from '../../types/dashboard-analytics';
import { formatKg } from '../../utils/format';
import type { DateRange } from '../ui/CalendarButton';
import DateNavigator from '../ui/DateNavigator';
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
  className?: string;
}

export default function DayDetail({
  day,
  onDayChange,
  period,
  data,
  className,
}: Props) {
  return (
    <SummaryCard
      title="Détail du jour"
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
        <StatTile label="Calories">{rounded(data?.totalKcal, 'kcal')}</StatTile>
        <StatTile label="Objectif">{rounded(data?.goalKcal, 'kcal')}</StatTile>
        <StatTile label="Poids">
          {typeof data?.weight === 'number'
            ? `${formatKg(data.weight)} kg`
            : '–'}
        </StatTile>
        {MACROS.map(({ key, label }) => (
          <StatTile key={key} label={label}>
            {rounded(data?.[MACRO_TOTAL_KEYS[key]], 'g')}
          </StatTile>
        ))}
      </dl>
    </SummaryCard>
  );
}
