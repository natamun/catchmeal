import { useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';

import { DropdownPanel } from '../ui/DropdownPanel';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export function DurationDropdown({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <Popover.Trigger asChild>
          <button
            ref={anchorRef}
            type="button"
            className="flex items-center gap-1 rounded-lg border border-green-200 bg-white px-2 py-0.5 text-xs text-green-800 outline-none focus:border-green-400"
          >
            {selected?.label}
            <ChevronDown className="h-3 w-3 shrink-0 text-green-400" />
          </button>
        </Popover.Trigger>
      </Popover.Anchor>
      <DropdownPanel container={document.body} matchAnchorWidth={false}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(o.value); setOpen(false); }}
            className={`w-full cursor-pointer border-t border-green-100 px-3 py-1.5 text-left text-xs transition-colors first:border-t-0 hover:bg-green-50 ${o.value === value ? 'font-semibold text-green-700' : 'text-green-800'}`}
          >
            {o.label}
          </button>
        ))}
      </DropdownPanel>
    </Popover.Root>
  );
}
