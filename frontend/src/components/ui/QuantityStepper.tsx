import { roundDecimals } from '../../utils/decimals';

const STEP_BUTTON_CLASS =
  'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-green-50 text-xs font-bold text-green-600 transition-colors hover:bg-green-100';

interface QuantityStepperProps {
  name: string;
  quantity: number;
  unitLabel: string;
  onAdjust: (delta: number) => void;
}

/** Buttons that change a quantity by -10, -1, +1 or +10, around its value. */
export function QuantityStepper({
  name,
  quantity,
  unitLabel,
  onAdjust,
}: QuantityStepperProps) {
  const stepButton = (delta: number, text: string) => (
    <button
      type="button"
      onClick={() => onAdjust(delta)}
      aria-label={`${delta < 0 ? 'Retirer' : 'Ajouter'} ${Math.abs(delta)} ${unitLabel} à ${name}`}
      className={STEP_BUTTON_CLASS}
    >
      {text}
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-1.5 select-none">
      {stepButton(-10, '--')}
      {stepButton(-1, '-')}
      <span className="min-w-10 text-center text-xs font-semibold text-green-800">
        {roundDecimals(quantity, 1)}
        {unitLabel}
      </span>
      {stepButton(1, '+')}
      {stepButton(10, '++')}
    </div>
  );
}
