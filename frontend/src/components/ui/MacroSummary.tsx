import { MACROS } from '../../constants/macros';
import { MacroBadge } from './MacroBadge';

interface MacroSummaryProps {
  totals: { kcal: number; protein: number; carbs: number; fat: number };
}

export function MacroSummary({ totals }: MacroSummaryProps) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-xl border border-green-200 px-3 py-2">
      <div className="flex items-center gap-3">
        {MACROS.map(({ key, label, color }) => (
          <MacroBadge
            key={key}
            label={label}
            color={color}
            value={Math.round(totals[key] * 10) / 10}
          />
        ))}
      </div>
      <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-semibold text-green-800">
        {Math.round(totals.kcal)} kcal
      </span>
    </div>
  );
}
