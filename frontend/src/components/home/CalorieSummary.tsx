import StatTile from '../ui/StatTile';
import SummaryCard from '../ui/SummaryCard';
import { progressLaps } from './progress';

interface Props {
  consumed: number;
  goal: number;
  isLoading?: boolean;
  unavailable?: boolean;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CalorieSummary({
  consumed,
  goal,
  isLoading = false,
  unavailable = false,
}: Props) {
  const over = consumed > goal;
  const difference = Math.abs(goal - consumed);
  const { lap, extraLap } = progressLaps(
    isLoading || unavailable ? 0 : consumed,
    goal,
  );

  return (
    <SummaryCard title="Calories du jour" busy={isLoading}>
      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-28 w-28 shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              className="stroke-green-100"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeDasharray={`${lap * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              className="stroke-green-400"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeDasharray={`${extraLap * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              className="stroke-green-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <span
                className="h-7 w-12 animate-pulse rounded bg-green-100"
                aria-hidden="true"
              />
            ) : (
              <p
                className="flex flex-col items-center leading-tight"
                aria-live="polite"
              >
                <span className="text-2xl font-bold text-green-800">
                  {unavailable ? '–' : difference}
                  {!unavailable && (
                    <span className="sr-only"> kilocalories</span>
                  )}
                </span>
                <span className="text-xs text-green-600">
                  {unavailable
                    ? 'indisponible'
                    : over
                      ? 'en trop'
                      : 'restantes'}
                </span>
              </p>
            )}
          </div>
        </div>
        <dl className="flex min-w-0 flex-1 flex-col gap-3">
          <StatTile label="Objectif">
            {goal}
            <span className="max-2xs:hidden"> kcal</span>
          </StatTile>
          <StatTile label="Consommées">
            {isLoading ? (
              <span
                className="block h-6 w-16 animate-pulse rounded bg-green-100"
                aria-hidden="true"
              />
            ) : unavailable ? (
              '–'
            ) : (
              <>
                {consumed}
                <span className="max-2xs:hidden"> kcal</span>
              </>
            )}
          </StatTile>
        </dl>
      </div>
    </SummaryCard>
  );
}
