import { useMemo } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';

import DailyMealPicker from '../components/home/DailyMealPicker';
import { useToast } from '../components/ui/toast-context';
import { PATHS } from '../routes';
import {
  journalPath,
  mealTypeFromSlug,
  parseDateParam,
} from '../routing/journal';
import { useGoBack } from '../routing/navigation';

export default function JournalAddPage() {
  const { mealType: slug } = useParams();
  const [searchParams] = useSearchParams();
  const showToast = useToast();
  const dateParam = searchParams.get('date');
  const date = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const mealType = mealTypeFromSlug(slug);
  const backToJournal = useGoBack(journalPath(date));

  if (!mealType) {
    return <Navigate to={PATHS.home} replace />;
  }

  return (
    <DailyMealPicker
      mealType={mealType}
      date={date}
      onClose={backToJournal}
      onAdded={() => {
        showToast('Ajouté au journal');
        backToJournal();
      }}
    />
  );
}
