import { CHART_HEIGHT } from './chartStyle';

export function ChartSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl bg-green-50"
      style={{ height: CHART_HEIGHT }}
      aria-hidden="true"
    />
  );
}
