interface Props {
  weight: number;
  height: number;
}

function getBmiCategory(bmi: number): { label: string; className: string } {
  if (bmi < 18.5)
    return {
      label: 'Insuffisance pondérale',
      className: 'bg-blue-100 text-blue-600',
    };
  if (bmi < 25)
    return { label: 'Poids normal', className: 'bg-green-100 text-green-600' };
  if (bmi < 30)
    return { label: 'Surpoids', className: 'bg-yellow-100 text-yellow-600' };
  return { label: 'Obésité', className: 'bg-red-100 text-red-600' };
}

export function BmiBadge({ weight, height }: Props) {
  const bmi = weight / Math.pow(height / 100, 2);
  const { label, className } = getBmiCategory(bmi);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      IMC {bmi.toFixed(1)} · {label}
    </span>
  );
}
