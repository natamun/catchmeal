import { useRef, useState } from 'react';
import { subYears } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { toApiDate } from '../meal/api';
import { CalendarTrigger } from '../ui/CalendarButton';

type View = 'year' | 'month' | 'day';

const YEARS_PER_PAGE = 20;
const ARROW_CLASS =
  'flex h-6 w-6 cursor-pointer items-center justify-center text-green-400 transition-colors hover:text-green-600 disabled:pointer-events-none disabled:opacity-30';

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function BirthDatePicker({ id, value, onChange }: Props) {
  const pickerRef = useRef<DatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('year');
  const today = new Date();
  const selected = value ? new Date(`${value}T12:00:00`) : null;

  return (
    <div className="flex flex-col">
      <DatePicker
        ref={pickerRef}
        id={id}
        selected={selected}
        openToDate={selected ?? subYears(today, YEARS_PER_PAGE)}
        maxDate={today}
        onSelect={(date: Date | null) => {
          if (!date) {
            return;
          }
          if (view === 'day') {
            onChange(toApiDate(date));
          } else {
            setView(view === 'year' ? 'month' : 'day');
          }
        }}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => {
          setIsOpen(false);
          setView('year');
        }}
        showYearPicker={view === 'year'}
        showMonthYearPicker={view === 'month'}
        yearItemNumber={YEARS_PER_PAGE}
        shouldCloseOnSelect={view === 'day'}
        locale={fr}
        calendarStartDay={1}
        calendarClassName="kcal-datepicker"
        popperProps={{ strategy: 'fixed' }}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          decreaseYear,
          increaseYear,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
          visibleYearsRange,
        }) => {
          const byMonth = view === 'day';
          const lastYear = visibleYearsRange?.endYear ?? date.getFullYear();
          const title = visibleYearsRange
            ? `${visibleYearsRange.startYear} – ${visibleYearsRange.endYear}`
            : date.toLocaleDateString(
                'fr-FR',
                byMonth
                  ? { month: 'long', year: 'numeric' }
                  : { year: 'numeric' },
              );

          return (
            <div className="flex items-center justify-between px-2">
              <button
                type="button"
                onClick={byMonth ? decreaseMonth : decreaseYear}
                disabled={byMonth && prevMonthButtonDisabled}
                aria-label="Précédent"
                className={ARROW_CLASS}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {view === 'year' ? (
                <span className="react-datepicker__current-month">{title}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setView(byMonth ? 'month' : 'year')}
                  aria-label={`${title}, changer ${byMonth ? 'de mois' : "d'année"}`}
                  className="react-datepicker__current-month cursor-pointer transition-colors hover:text-green-600"
                >
                  {title}
                </button>
              )}
              <button
                type="button"
                onClick={byMonth ? increaseMonth : increaseYear}
                disabled={
                  byMonth
                    ? nextMonthButtonDisabled
                    : lastYear >= today.getFullYear()
                }
                aria-label="Suivant"
                className={ARROW_CLASS}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          );
        }}
        customInput={
          <CalendarTrigger
            isOpen={isOpen}
            onClose={() => pickerRef.current?.setOpen(false)}
            className="w-full rounded-xl border border-green-200 bg-white px-4 py-2.5 text-left text-sm text-green-800 transition-colors hover:bg-green-50"
          >
            {selected ? (
              selected.toLocaleDateString('fr-FR')
            ) : (
              <span className="text-green-800/50">Sélectionner une date</span>
            )}
          </CalendarTrigger>
        }
      />
    </div>
  );
}
