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
      minDate={min}
      maxDate={max}
      customInput={
        <CustomInput className="transform rounded-2xl bg-[#ECF8F6] px-2 py-1 text-center font-semibold shadow-sm transition duration-300 hover:scale-110 hover:shadow-md" />
      }
    />
  );
}
