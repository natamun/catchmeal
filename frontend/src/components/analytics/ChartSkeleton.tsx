import { CHART_HEIGHT } from './chartStyle';

/** Pulsing block the size of a chart, shown while the stats load. */
export function ChartSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl bg-green-50"
      style={{ height: CHART_HEIGHT }}
      aria-hidden="true"
    />
  );
}
