interface PillTabsProps<T extends string> {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A choice between a few options shown as pills. They are real radio buttons
 * underneath, so the keyboard and screen readers handle them natively.
 */
export function PillTabs<T extends string>({
  name,
  options,
  value,
  onChange,
  className = '',
}: PillTabsProps<T>) {
  return (
    <div
      className={`flex gap-1.5 rounded-xl border border-green-200 bg-white p-1.5 ${className}`}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-green-500 transition-colors has-checked:animate-pill-select has-checked:bg-green-500 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-green-400"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
