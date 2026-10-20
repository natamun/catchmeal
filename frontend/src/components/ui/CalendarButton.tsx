import {
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import { fr } from 'date-fns/locale/fr';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

/** A period from `from` to `to`, both days included. */
export interface DateRange {
  from: Date;
  to: Date;
}

interface TriggerProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  id?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The button that opens the calendar. Clicked again while the calendar is open,
 * it closes it instead of reopening it.
 */
export function CalendarTrigger({
  children,
  isOpen,
  onClose,
  id,
  className,
  onClick,
  onKeyDown,
  ref,
}: TriggerProps) {
  return (
    <button
      type="button"
      id={id}
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
      className={`cursor-pointer *:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

interface SharedProps {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
  min?: Date;
  max?: Date;
  placement?: ComponentProps<typeof DatePicker>['popperPlacement'];
}

interface DayProps extends SharedProps {
  value: Date;
  onChange: (date: Date) => void;
}

interface RangeProps extends SharedProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

/**
 * A button that opens a French calendar (weeks start on Monday). Two modes: one
 * day (`value` and `onChange`) or a period (`range` and `onRangeChange`). For a
 * period, the first click is kept aside until the second one completes it.
 */
export function CalendarButton(props: DayProps | RangeProps) {
  const { children, className, wrapperClassName, min, max, placement } = props;
  const pickerRef = useRef<DatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<Date | null>(null);

  const calendar = {
    onCalendarOpen: () => setIsOpen(true),
    onCalendarClose: () => {
      setIsOpen(false);
      setPendingStart(null);
    },
    minDate: min,
    maxDate: max,
    locale: fr,
    calendarStartDay: 1,
    calendarClassName: 'kcal-datepicker',
    wrapperClassName,
    portalId: 'datepicker-portal',
    popperPlacement: placement,
    customInput: (
      <CalendarTrigger
        isOpen={isOpen}
        onClose={() => pickerRef.current?.setOpen(false)}
        className={className}
      >
        {children}
      </CalendarTrigger>
    ),
  } as const;

  if ('range' in props) {
    const { range, onRangeChange } = props;

    return (
      <DatePicker
        ref={pickerRef}
        {...calendar}
        selectsRange
        swapRange
        startDate={pendingStart ?? range.from}
        endDate={pendingStart ? null : range.to}
        onChange={([start, end]: [Date | null, Date | null]) => {
          setPendingStart(end ? null : start);
          if (start && end) {
            onRangeChange({ from: start, to: end });
          }
        }}
      />
    );
  }

  const { value, onChange } = props;

  return (
    <DatePicker
      ref={pickerRef}
      {...calendar}
      selected={value}
      onChange={(date: Date | null) => {
        if (date) {
          onChange(date);
        }
      }}
    />
  );
}
