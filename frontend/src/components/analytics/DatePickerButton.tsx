import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { forwardRef } from 'react';

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
  date: Date | null;
  min: Date;
  max: Date;
  setValue: (date: Date | null) => void;
};

export function DatePickerButton({
  date,
  min,
  max,
  setValue,
}: CustomInputProps): React.ReactElement {
  return (
    <DatePicker
      selected={date}
      onChange={setValue}
      dateFormat="dd MMM yyyy"
      minDate={min}
      maxDate={max}
      customInput={
        <CustomInput className="rounded-2xl bg-[#ECF8F6] px-2 py-1 text-center font-semibold shadow-[0_4px_0_0_#7FC8B8] transition-all duration-150 hover:brightness-95 active:translate-y-1 active:shadow-[0_1px_0_0_#7FC8B8]" />
      }
    />
  );
}
