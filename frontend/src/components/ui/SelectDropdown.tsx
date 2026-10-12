import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight } from 'lucide-react';

import { DropdownPanel } from './DropdownPanel';

interface Option {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  id?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  container: HTMLElement | null;
  placeholder?: string;
  className?: string;
}

export function SelectDropdown({
  id,
  value,
  options,
  onChange,
  container,
  placeholder = '—',
  className = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          className={`flex w-full cursor-pointer items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-2.5 text-left text-sm text-green-800 transition-colors outline-none hover:bg-green-50 focus:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 ${className}`}
        >
          <span className={selected ? '' : 'text-green-800/50'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-green-400 transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </button>
      </Popover.Trigger>
      <DropdownPanel container={container} matchAnchorWidth moveFocus>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-current={o.value === value}
            onClick={() => {
              onChange(o.value);
              setOpen(false);
            }}
            className={`cursor-pointer border-t border-green-100 px-4 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-green-50 ${
              o.value === value
                ? 'font-semibold text-green-800'
                : 'text-green-600'
            }`}
          >
            {o.label}
          </button>
        ))}
      </DropdownPanel>
    </Popover.Root>
  );
}
