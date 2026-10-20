import type { TooltipContentProps } from 'recharts';

import { TooltipFrame, TooltipRow } from './ChartTooltip';
import { MACRO_SERIES } from './macroSeries';
import type { KcalPoint } from './types';

interface Props extends TooltipContentProps {
  averaged: boolean;
}

export default function MacroTooltip({
  active,
  payload,
  label,
  averaged,
}: Props) {
  const point = payload[0]?.payload as KcalPoint | undefined;

  if (!active || !point) {
    return null;
  }

  return (
    <TooltipFrame
      title={averaged ? `Du ${point.from} au ${point.date}` : label}
    >
      <ul className="flex flex-col gap-0.5">
        {MACRO_SERIES.map(({ key, label: name, fill }) => (
          <TooltipRow key={key} color={fill} name={name}>
            {point[key]} g
          </TooltipRow>
        ))}
      </ul>
      <p className="mt-1.5 flex justify-between gap-4 border-t border-green-200 pt-1.5 text-sm">
        <span className="text-green-600">
          {averaged ? 'Moyenne par jour' : 'Total'}
        </span>
        <span className="font-semibold text-green-800 tabular-nums">
          {point.kcal} kcal
        </span>
      </p>
    </TooltipFrame>
  );
}
