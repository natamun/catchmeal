import { useMemo } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import {
  CartesianGrid,
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
import {
  AXIS_WIDTH,
  CHART_HEIGHT,
  GRID_STROKE,
  MIN_TICK_GAP,
  X_TICK,
  Y_TICK,
} from './chartStyle';
import ChartTooltip from './ChartTooltip';

const MARGIN_KG = 2;
const MAX_INTERVALS = 8;
const SCALE_STEPS = [1, 2, 5, 10, 20];
const MAX_DOTS = 31;
const LINE_COLOR = 'var(--color-green-500)';
const DAY_MS = 24 * 60 * 60 * 1000;

function weightScale(weights: number[]) {
  const low = Math.max(0, Math.floor(Math.min(...weights)) - MARGIN_KG);
  const high = Math.ceil(Math.max(...weights)) + MARGIN_KG;
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
  days: DashboardDay[];
  period: DateRange;
}

export default function WeightChart({ days, period }: Props) {
  const points = useMemo(
    () =>
      days.flatMap(({ day, weight }) =>
        weight === null
          ? []
          : [{ time: new Date(`${day}T12:00:00`).getTime(), weight }],
      ),
    [days],
  );

  if (points.length === 0) {
    return (
      <SummaryCard title="Évolution du poids">
        <p className="text-sm text-green-600">
          Aucune pesée sur cette période.
        </p>
      </SummaryCard>
    );
  }

  const scale = weightScale(points.map((point) => point.weight));
  const timeDomain =
    points.length === 1
      ? [points[0].time - DAY_MS, points[0].time + DAY_MS]
      : [startOfDay(period.from).getTime(), endOfDay(period.to).getTime()];

  return (
    <SummaryCard title="Évolution du poids">
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
          <Line
            type="linear"
            dataKey="weight"
            name="Poids"
            unit="kg"
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
