import {
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type Ref,
} from 'react';
import { fr } from 'date-fns/locale/fr';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

const ARROW_CLASS =
  'flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-green-500 transition-colors hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400';

function shiftDay(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function formatLabel(date: Date) {
  const today = new Date();

  if (isSameDay(date, today)) {
    return "Aujourd'hui";
  }
  if (isSameDay(date, shiftDay(today, -1))) {
    return 'Hier';
  }
  if (isSameDay(date, shiftDay(today, 1))) {
    return 'Demain';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

interface DateButtonProps {
  label: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement>;
}

function DateButton({
  label,
  isOpen,
  onClose,
  className,
  onClick,
  onKeyDown,
  ref,
}: DateButtonProps) {
  return (
    <button
      type="button"
      ref={ref}
      onClick={(event) => {
        if (isOpen) {
          onClose();
        } else {
          onClick?.(event);
        }
      }}
      onKeyDown={onKeyDown}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-live="polite"
      className={`w-36 cursor-pointer rounded-lg bg-green-500 px-3 py-1.5 text-center text-sm font-medium text-white capitalize transition-colors hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 max-2xs:w-full ${className ?? ''}`}
    >
      {label}
    </button>
  );
}

interface DateNavigatorProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateNavigator({ value, onChange }: DateNavigatorProps) {
  const pickerRef = useRef<DatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex gap-1.5 self-start rounded-xl border border-green-200 bg-white p-1.5 max-2xs:w-full">
      <button
        type="button"
        onClick={() => onChange(shiftDay(value, -1))}
        aria-label="Jour précédent"
        className={ARROW_CLASS}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <DatePicker
        ref={pickerRef}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        selected={value}
        onChange={(date: Date | null) => {
          if (date) {
            onChange(date);
          }
        }}
        locale={fr}
        calendarStartDay={1}
        calendarClassName="kcal-datepicker"
        wrapperClassName="max-2xs:flex-1"
        portalId="datepicker-portal"
        customInput={
          <DateButton
            label={formatLabel(value)}
            isOpen={isOpen}
            onClose={() => pickerRef.current?.setOpen(false)}
          />
        }
      />
      <button
        type="button"
        onClick={() => onChange(shiftDay(value, 1))}
        aria-label="Jour suivant"
        className={ARROW_CLASS}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
