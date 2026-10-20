import { useMemo } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { formatWeekday } from '../../utils/format';
import type { DateRange } from '../ui/CalendarButton';
import { SelectDropdown } from '../ui/SelectDropdown';
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
import type { DashboardDay } from './types';

const TITLE = 'Évolution';
const SELECT_ID = 'stats-measure';
const SCALE_MARGIN = 1;
const MAX_INTERVALS = 8;
const SCALE_STEPS = [1, 2, 5, 10, 20];
const MAX_DOTS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;
const [LINE_COLOR, TARGET_COLOR] = SERIES_COLORS;

export type MeasureKey =
  'weight' | 'bodyFat' | 'fatFreeMass' | 'bodyWater' | 'muscleMass';

const MEASURES: { value: MeasureKey; label: string; unit: string }[] = [
  { value: 'weight', label: 'Poids', unit: 'kg' },
  { value: 'muscleMass', label: 'Masse musculaire', unit: 'kg' },
  { value: 'fatFreeMass', label: 'Masse maigre', unit: 'kg' },
  { value: 'bodyFat', label: 'Masse grasse', unit: '%' },
  { value: 'bodyWater', label: 'Eau corporelle', unit: '%' },
];

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
  measure: MeasureKey;
  onMeasureChange: (measure: MeasureKey) => void;
  targetWeight: number | null;
  days: DashboardDay[];
  period: DateRange;
  isLoading?: boolean;
}

export default function MeasureChart({
  measure,
  onMeasureChange,
  targetWeight,
  days,
  period,
  isLoading = false,
}: Props) {
  const points = useMemo(
    () =>
      days.flatMap((day) => {
        const value = day[measure];

        return value === null
          ? []
          : [{ value, time: new Date(`${day.day}T12:00:00`).getTime() }];
      }),
    [days, measure],
  );

  const { label, unit } =
    MEASURES.find(({ value }) => value === measure) ?? MEASURES[0];
  const selector = (
    <>
      <label htmlFor={SELECT_ID} className="sr-only">
        Mesure affichée
      </label>
      <SelectDropdown
        id={SELECT_ID}
        size="sm"
        className="w-36"
        value={measure}
        options={MEASURES}
        onChange={(value) => onMeasureChange(value as MeasureKey)}
        container={document.body}
      />
    </>
  );

  if (isLoading) {
    return (
      <SummaryCard title={TITLE} aside={selector} inlineAside busy>
        <ChartSkeleton />
      </SummaryCard>
    );
  }

  if (points.length === 0) {
    return (
      <SummaryCard title={TITLE} aside={selector} inlineAside>
        <p className="text-sm text-green-600">
          {measure === 'weight'
            ? 'Aucune pesée sur cette période.'
            : 'Aucune mesure sur cette période.'}
        </p>
      </SummaryCard>
    );
  }

  const scale = measureScale(points.map(({ value }) => value));
  const timeDomain =
    points.length === 1
      ? [points[0].time - DAY_MS, points[0].time + DAY_MS]
      : [startOfDay(period.from).getTime(), endOfDay(period.to).getTime()];

  return (
    <SummaryCard title={TITLE} aside={selector} inlineAside>
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
            content={(props: TooltipContentProps) => (
              <ChartTooltip
                {...props}
                label={formatWeekday(new Date(Number(props.label)))}
              />
            )}
          />
          {measure === 'weight' && targetWeight !== null && (
            <ReferenceLine
              y={targetWeight}
              stroke={TARGET_COLOR}
              strokeDasharray="4 4"
              label={{
                value: 'Objectif',
                position: 'insideBottomRight',
                fontSize: 11,
                fill: TARGET_COLOR,
              }}
            />
          )}
          <Line
            type="linear"
            dataKey="value"
            name={label}
            unit={unit}
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={
              points.length <= MAX_DOTS
                ? { r: 3.5, fill: LINE_COLOR, strokeWidth: 0 }
                : false
            }
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </SummaryCard>
  );
}
