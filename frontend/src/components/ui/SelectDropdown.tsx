import { useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight } from 'lucide-react';

import { DropdownPanel } from './DropdownPanel';

interface Option {
  value: string;
  label: string;
}

const SIZE = {
  md: {
    trigger: 'rounded-xl px-4 py-2.5 text-sm',
    width: 'w-full',
    icon: 'h-4 w-4',
    option: 'px-4 py-2 text-sm',
  },
  sm: {
    trigger: 'gap-1 rounded-lg px-2 py-0.5 text-xs',
    width: 'w-28',
    icon: 'h-3 w-3',
    option: 'px-3 py-1.5 text-xs',
  },
} as const;

interface SelectDropdownProps {
  id?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  container: HTMLElement | null;
  placeholder?: string;
  size?: keyof typeof SIZE;
  className?: string;
}

export function SelectDropdown({
  id,
  value,
  options,
  onChange,
  container,
  placeholder = '—',
  size = 'md',
  className = SIZE[size].width,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          ref={triggerRef}
          type="button"
          className={`flex cursor-pointer items-center justify-between border border-green-200 bg-white text-left text-green-800 transition-colors outline-none hover:bg-green-50 focus:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-1 aria-expanded:bg-green-50 ${SIZE[size].trigger} ${className}`}
        >
          <span className={selected ? '' : 'text-green-800/50'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronRight
            className={`shrink-0 text-green-400 transition-transform ${SIZE[size].icon} ${open ? 'rotate-90' : ''}`}
          />
        </button>
      </Popover.Trigger>
      <DropdownPanel
        container={container}
        matchAnchorWidth
        moveFocus
        onInteractOutside={(event) => {
          const labels = [...(triggerRef.current?.labels ?? [])];

          if (labels.some((label) => label.contains(event.target as Node))) {
            event.preventDefault();
          }
        }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-current={o.value === value}
            onClick={() => {
              onChange(o.value);
              setOpen(false);
            }}
            className={`cursor-pointer border-t border-green-100 text-left transition-colors first:border-t-0 hover:bg-green-50 ${SIZE[size].option} ${
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
