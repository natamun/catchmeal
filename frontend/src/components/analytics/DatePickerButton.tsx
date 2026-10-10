import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { forwardRef } from 'react';
import type { Placement } from '@floating-ui/react';

type ExampleCustomInputProps = {
  className?: string;
  value?: string;
  onClick?: () => void;
};

export const CustomInput = forwardRef<
  HTMLButtonElement,
  ExampleCustomInputProps
>(({ value, onClick, className }, ref) => (
  <button type="button" className={className} onClick={onClick} ref={ref}>
    {value}
  </button>
));

type CustomInputProps = {
  date: string | null;
  min: string;
  max: string;
  placement?: Placement;
  dateFormat?: string;
  setValue: (date: string) => void;
};

function toDayString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePickerButton({
  date,
  min,
  max,
  placement,
  dateFormat,
  setValue,
}: CustomInputProps): React.ReactElement {
  return (
    <DatePicker
      selected={date ? new Date(date) : null}
      onChange={(d: Date | null) => setValue(d ? toDayString(d) : '')}
      dateFormat={dateFormat ? dateFormat : 'dd MMM yyyy'}
      minDate={new Date(min)}
      maxDate={new Date(max)}
      popperPlacement={placement ?? undefined}
      portalId="datepicker-portal"
      customInput={
        <CustomInput className="cursor-pointer rounded-full bg-green-50 px-5 py-1.5 text-sm font-semibold ring-1 ring-green-500 hover:bg-emerald-100/60" />
      }
    />
  );
}
