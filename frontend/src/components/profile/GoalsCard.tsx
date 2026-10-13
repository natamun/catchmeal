import { useState } from 'react';

import type { AuthUser } from '../../auth/auth-context';
import { calculateBMR, calculateTDEE } from '../../utils/bmr';
import { formatKg } from '../../utils/format';
import { SelectDropdown } from '../ui/SelectDropdown';
import Skeleton from '../ui/Skeleton';
import StatTile from '../ui/StatTile';
import SummaryCard from '../ui/SummaryCard';
import { formatMeasure } from './measures';

const DURATION_OPTIONS = [
  { value: '14', label: '2 semaines' },
  { value: '30', label: '1 mois' },
  { value: '60', label: '2 mois' },
  { value: '90', label: '3 mois' },
  { value: '120', label: '4 mois' },
  { value: '150', label: '5 mois' },
  { value: '180', label: '6 mois' },
  { value: '365', label: '1 an' },
];

interface Props {
  user: AuthUser;
  latestWeight: number | null | undefined;
}

export function GoalsCard({ user, latestWeight }: Props) {
  const [duration, setDuration] = useState('90');
  const isLoading = latestWeight === undefined;

  const bmr =
    latestWeight && user.height && user.birthDate && user.gender
      ? calculateBMR(
          latestWeight,
          user.height,
          user.birthDate,
          user.gender,
          user.muscleMass,
        )
      : null;

  const tdee =
    bmr && user.activityLevel ? calculateTDEE(bmr, user.activityLevel) : null;

  const kcalToReachGoal = (() => {
    if (!tdee || !latestWeight || !user.targetWeight) return null;
    const diff = latestWeight - user.targetWeight;
    const coefficient = diff > 0 ? 7700 : 4800;
    return Math.round(tdee - (diff * coefficient) / Number(duration));
  })();

  const recommendedKcal = kcalToReachGoal ?? tdee;

  const recommendedMacros = (() => {
    if (!recommendedKcal || !latestWeight) return null;
    const protein = Math.round(
      user.muscleMass ? 2.2 * user.muscleMass : 1.8 * latestWeight,
    );
    const fat = Math.round((recommendedKcal * 0.3) / 9);
    const carbs = Math.round((recommendedKcal - protein * 4 - fat * 9) / 4);
    return carbs > 0 ? { protein, fat, carbs } : null;
  })();

  const rows = [
    {
      label: 'Calories',
      unit: 'kcal',
      goal: user.dailyCalorieGoal ?? null,
      recommended: recommendedKcal,
    },
    {
      label: 'Protéines',
      unit: 'g',
      goal: user.dailyProteinGoal ?? null,
      recommended: recommendedMacros?.protein ?? null,
    },
    {
      label: 'Glucides',
      unit: 'g',
      goal: user.dailyCarbsGoal ?? null,
      recommended: recommendedMacros?.carbs ?? null,
    },
    {
      label: 'Lipides',
      unit: 'g',
      goal: user.dailyFatGoal ?? null,
      recommended: recommendedMacros?.fat ?? null,
    },
  ];

  const gap =
    latestWeight && user.targetWeight ? latestWeight - user.targetWeight : null;
  const remaining =
    gap === null
      ? null
      : Math.abs(gap) < 0.05
        ? 'Poids cible atteint'
        : `${formatMeasure(Math.abs(gap), 'kg')} ${gap > 0 ? 'à perdre' : 'à prendre'}`;

  const renderBasis = () => {
    if (isLoading) {
      return <Skeleton className="h-5 w-48" />;
    }
    if (recommendedKcal === null) {
      return 'Complétez le profil et ajoutez une pesée pour obtenir des recommandations.';
    }
    if (kcalToReachGoal === null) {
      return 'Recommandé pour maintenir le poids actuel';
    }

    return (
      <>
        Recommandé pour {formatMeasure(user.targetWeight ?? null, 'kg')}{' '}
        <span className="inline-flex items-center gap-1.5 align-middle whitespace-nowrap">
          en
          <SelectDropdown
            size="sm"
            value={duration}
            options={DURATION_OPTIONS}
            onChange={setDuration}
            container={document.body}
          />
        </span>
      </>
    );
  };

  return (
    <SummaryCard
      title="Mes objectifs"
      busy={isLoading}
      aside={
        <p className="text-sm text-green-600">
          {remaining && (
            <>
              <span className="font-semibold text-green-800">{remaining}</span>
              {' · '}
            </>
          )}
          {renderBasis()}
        </p>
      }
    >
      <dl className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ label, unit, goal, recommended }) => (
          <StatTile key={label} label={label}>
            {recommended === null ? (
              formatMeasure(goal, unit)
            ) : (
              <>
                <span className="sr-only">Objectif : </span>
                {goal === null ? '–' : formatKg(goal)}{' '}
                <span className="font-normal whitespace-nowrap text-green-600">
                  <span aria-hidden="true">/ </span>
                  <span className="sr-only">, recommandé : </span>
                  {formatMeasure(recommended, unit)}
                </span>
              </>
            )}
          </StatTile>
        ))}
      </dl>
    </SummaryCard>
  );
}
