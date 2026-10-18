import { useMemo } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router';

import DailyMealPicker from '../components/home/DailyMealPicker';
import type { AppLayoutContext } from '../components/layout/AppLayout';
import { PATHS } from '../routes';
import {
  journalPath,
  mealTypeFromSlug,
  parseDateParam,
} from '../routing/journal';

export default function JournalAddPage() {
  const { mealType: slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useOutletContext<AppLayoutContext>();
  const dateParam = searchParams.get('date');
  const date = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const mealType = mealTypeFromSlug(slug);

  if (!mealType) {
    return <Navigate to={PATHS.home} replace />;
  }

  const backToJournal = () =>
    void (location.key === 'default'
      ? navigate(journalPath(date), { replace: true })
      : navigate(-1));

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
