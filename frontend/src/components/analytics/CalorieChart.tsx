import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  useActiveTooltipLabel,
  useIsTooltipActive,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';

import type {
  DashboardDay,
  DataGraph,
  Grain,
  KcalPoint,
} from '../../types/dashboard-analytics';
import buildDataGraph from '../../utils/buildDataGraph';
import SummaryCard from '../ui/SummaryCard';
import ChartSkeleton from './ChartSkeleton';
import {
  AXIS_WIDTH,
  CHART_HEIGHT,
  GRID_STROKE,
  MIN_TICK_GAP,
  X_TICK,
  Y_TICK,
} from './chartStyle';
import { MACRO_SERIES, UNSPLIT_SERIES } from './macroSeries';
import MacroTooltip from './MacroTooltip';

const GRAIN_CAPTION: Record<Grain, string> = {
  day: 'Par jour',
  week: 'Moyenne par semaine',
  biWeek: 'Moyenne sur 2 semaines',
};

const INITIAL_WIDTH = 530;
const PX_PER_POINT = 24;
const MAX_BAR_SIZE = 25;
const TOP_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
const KCAL_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 };
const SCALE_STEPS = [50, 100, 250, 500, 1000, 1500, 2000, 2500, 5000];
const MAX_INTERVALS = 5;
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;
const ALL_SERIES = [...MACRO_SERIES, UNSPLIT_SERIES];
const SERIES_ORDER: string[] = ALL_SERIES.map(({ dataKey }) => dataKey);
const TOP_SERIES: string[] = [
  MACRO_SERIES[MACRO_SERIES.length - 1].dataKey,
  UNSPLIT_SERIES.dataKey,
];

function grainForWidth(w: number, dataLength: number): Grain {
  const plotWidth = w - AXIS_WIDTH - KCAL_MARGIN.right;
  const maxPoints = Math.floor(plotWidth / PX_PER_POINT);
  if (dataLength <= maxPoints) return 'day';
  if (Math.ceil(dataLength / 7) <= maxPoints) return 'week';
  return 'biWeek';
}

function scaleTicks(max: number) {
  const largestStep = SCALE_STEPS[SCALE_STEPS.length - 1];
  const fallback = {
    step: largestStep,
    count: Math.max(1, Math.ceil(max / largestStep)),
  };
  const { step, count } = SCALE_STEPS.map((candidate) => ({
    step: candidate,
    count: Math.max(1, Math.ceil(max / candidate)),
  }))
    .filter((candidate) => candidate.count <= MAX_INTERVALS)
    .reduce(
      (best, candidate) =>
        candidate.step * candidate.count < best.step * best.count
          ? candidate
          : best,
      fallback,
    );

  return {
    ticks: Array.from({ length: count + 1 }, (_, index) => index * step),
    top: step * count,
  };
}

function splitByMacro(point: DataGraph): KcalPoint {
  const protein = point.protein * KCAL_PER_GRAM.protein;
  const carbs = point.carbs * KCAL_PER_GRAM.carbs;
  const fat = point.fat * KCAL_PER_GRAM.fat;
  const total = protein + carbs + fat;
  const scale = total > 0 ? point.kcal / total : 0;

  return {
    ...point,
    proteinKcal: protein * scale,
    carbsKcal: carbs * scale,
    fatKcal: fat * scale,
    otherKcal: total > 0 ? 0 : point.kcal,
  };
}

function MacroSegment(props: BarShapeProps) {
  const hovering = useIsTooltipActive();
  const activeLabel = useActiveTooltipLabel();
  const point = props.payload as KcalPoint;
  const dimmed = hovering && activeLabel !== point.from;

  return (
    <Rectangle
      {...props}
      className="transition-opacity"
      opacity={dimmed ? 0.4 : 1}
    />
  );
}

const renderSegment = (props: BarShapeProps) => <MacroSegment {...props} />;

interface Props {
  days: DashboardDay[];
  isLoading?: boolean;
}

export default function CalorieChart({ days, isLoading = false }: Props) {
  const [width, setWidth] = useState(INITIAL_WIDTH);

  const dataLength = days.length;

  const grain = useMemo<Grain>(
    () => grainForWidth(width, dataLength),
    [width, dataLength],
  );

  const data = useMemo<DataGraph[]>(
    () => buildDataGraph(days, grain),
    [days, grain],
  );

  const kcalData = useMemo(() => data.map(splitByMacro), [data]);

  const kcalScale = useMemo(
    () => scaleTicks(Math.max(0, ...data.map((point) => point.kcal))),
    [data],
  );

  const series = kcalData.some((point) => point.otherKcal > 0)
    ? ALL_SERIES
    : MACRO_SERIES;
  const averaged = grain !== 'day';

  if (isLoading) {
    return (
      <SummaryCard title="Calories et macronutriments" busy>
        <ChartSkeleton />
      </SummaryCard>
    );
  }

  return (
    <SummaryCard
      title="Calories et macronutriments"
      aside={
        <span className="text-sm text-green-600">{GRAIN_CAPTION[grain]}</span>
      }
    >
      <ResponsiveContainer
        width="100%"
        height={CHART_HEIGHT}
        onResize={setWidth}
      >
        <BarChart data={kcalData} margin={KCAL_MARGIN}>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="from" tick={X_TICK} minTickGap={MIN_TICK_GAP} />
          <YAxis
            width={AXIS_WIDTH}
            interval={0}
            ticks={kcalScale.ticks}
            domain={[0, kcalScale.top]}
            tick={Y_TICK}
          />
          <Tooltip
            cursor={false}
            content={(props: TooltipContentProps) => (
              <MacroTooltip {...props} averaged={averaged} />
            )}
          />
          {series.map(({ dataKey, label, fill }) => (
            <Bar
              key={dataKey}
              dataKey={dataKey}
              name={label}
              stackId="kcal"
              fill={fill}
              maxBarSize={MAX_BAR_SIZE}
              shape={renderSegment}
              radius={TOP_SERIES.includes(dataKey) ? TOP_RADIUS : 0}
            />
          ))}
          <Legend
            itemSorter={(item) => SERIES_ORDER.indexOf(String(item.dataKey))}
            formatter={(name: string) => (
              <span className="text-sm text-green-700">{name}</span>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </SummaryCard>
  );
}
