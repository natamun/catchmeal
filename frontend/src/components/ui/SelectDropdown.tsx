import { useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';

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
  const anchorRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <Popover.Trigger asChild>
          <button
            id={id}
            ref={anchorRef}
            type="button"
            className={`flex w-full items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-2.5 text-left text-sm text-green-800 outline-none focus:border-green-400 ${className}`}
          >
            <span className={selected ? '' : 'text-green-400'}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-green-400" />
          </button>
        </Popover.Trigger>
      </Popover.Anchor>
      <DropdownPanel container={container} matchAnchorWidth>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(o.value);
              setOpen(false);
            }}
            className={`w-full cursor-pointer border-t border-green-100 px-4 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-green-50 ${o.value === value ? 'font-semibold text-green-700' : 'text-green-800'}`}
          >
            {o.label}
          </button>
        ))}
      </DropdownPanel>
    </Popover.Root>
  );
}
