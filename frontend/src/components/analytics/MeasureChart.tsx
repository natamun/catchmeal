import { useMemo } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import type { DashboardDay } from '../../types/dashboard-analytics';
import { formatWeekday } from '../../utils/format';
import type { DateRange } from '../ui/CalendarButton';
import SummaryCard from '../ui/SummaryCard';
import ChartSkeleton from './ChartSkeleton';
import {
  AXIS_WIDTH,
  CHART_HEIGHT,
  GRID_STROKE,
  MIN_TICK_GAP,
  SERIES_COLORS,
  X_TICK,
  Y_TICK,
} from './chartStyle';
import ChartTooltip from './ChartTooltip';
import { legendLabel } from './legendLabel';

const SCALE_MARGIN = 2;
const MAX_INTERVALS = 8;
const SCALE_STEPS = [1, 2, 5, 10, 20];
const MAX_DOTS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

type MeasureKey =
  'weight' | 'bodyFat' | 'fatFreeMass' | 'bodyWater' | 'muscleMass';

export interface MeasureSeries {
  key: MeasureKey;
  label: string;
}

function measureScale(values: number[]) {
  const low = Math.max(0, Math.floor(Math.min(...values)) - SCALE_MARGIN);
  const high = Math.ceil(Math.max(...values)) + SCALE_MARGIN;
  const step =
    SCALE_STEPS.find(
      (candidate) => (high - low) / candidate <= MAX_INTERVALS,
    ) ?? SCALE_STEPS[SCALE_STEPS.length - 1];
  const bottom = Math.floor(low / step) * step;
  const top = Math.ceil(high / step) * step;

  return {
    bottom,
    top,
    ticks: Array.from(
      { length: (top - bottom) / step + 1 },
      (_, index) => bottom + index * step,
    ),
  };
}

function formatTick(time: number) {
  return new Date(time)
    .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    .replace('/', '-');
}

interface Props {
  title: string;
  unit: string;
  series: MeasureSeries[];
  emptyMessage: string;
  days: DashboardDay[];
  period: DateRange;
  isLoading?: boolean;
}

export default function MeasureChart({
  title,
  unit,
  series,
  emptyMessage,
  days,
  period,
  isLoading = false,
}: Props) {
  const points = useMemo(
    () =>
      days.flatMap((day) =>
        series.some(({ key }) => day[key] !== null)
          ? [{ ...day, time: new Date(`${day.day}T12:00:00`).getTime() }]
          : [],
      ),
    [days, series],
  );

  if (isLoading) {
    return (
      <SummaryCard title={title} busy>
        <ChartSkeleton />
      </SummaryCard>
    );
  }

  if (points.length === 0) {
    return (
      <SummaryCard title={title}>
        <p className="text-sm text-green-600">{emptyMessage}</p>
      </SummaryCard>
    );
  }

  const shown = series
    .map((entry, index) => ({ ...entry, color: SERIES_COLORS[index] }))
    .filter(({ key }) => points.some((point) => point[key] !== null));
  const order = shown.map(({ key }) => key as string);
  const byOrder = (item: { dataKey?: unknown }) =>
    order.indexOf(String(item.dataKey));
  const scale = measureScale(
    points.flatMap((point) => series.flatMap(({ key }) => point[key] ?? [])),
  );
  const timeDomain =
    points.length === 1
      ? [points[0].time - DAY_MS, points[0].time + DAY_MS]
      : [startOfDay(period.from).getTime(), endOfDay(period.to).getTime()];

  return (
    <SummaryCard title={title}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart
          data={points}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={timeDomain}
            tickFormatter={formatTick}
            tick={X_TICK}
            minTickGap={MIN_TICK_GAP}
          />
          <YAxis
            width={AXIS_WIDTH}
            interval={0}
            ticks={scale.ticks}
            domain={[scale.bottom, scale.top]}
            tick={Y_TICK}
          />
          <Tooltip
            cursor={false}
            itemSorter={byOrder}
            content={(props: TooltipContentProps) => (
              <ChartTooltip
                {...props}
                label={formatWeekday(new Date(Number(props.label)))}
              />
            )}
          />
          {shown.map(({ key, label, color }) => (
            <Line
              key={key}
              type="linear"
              dataKey={key}
              name={label}
              unit={unit}
              stroke={color}
              strokeWidth={2}
              connectNulls
              dot={
                points.length <= MAX_DOTS
                  ? { r: 3.5, fill: color, strokeWidth: 0 }
                  : false
              }
              activeDot={{ r: 5 }}
            />
          ))}
          {shown.length > 1 && (
            <Legend itemSorter={byOrder} formatter={legendLabel} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </SummaryCard>
  );
}
