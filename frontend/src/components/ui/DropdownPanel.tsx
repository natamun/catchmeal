import type { ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';

interface DropdownPanelProps {
  container: HTMLElement | null;
  align?: 'start' | 'center' | 'end';
  matchAnchorWidth?: boolean;
  moveFocus?: boolean;
  children: ReactNode;
}

export function DropdownPanel({
  container,
  align = 'start',
  matchAnchorWidth = false,
  moveFocus = false,
  children,
}: DropdownPanelProps) {
  if (!container) {
    return null;
  }

  const keepFocus = (event: Event) => {
    if (!moveFocus) {
      event.preventDefault();
    }
  };

  return (
    <Popover.Portal container={container}>
      <Popover.Content
        align={align}
        sideOffset={4}
        onOpenAutoFocus={keepFocus}
        onCloseAutoFocus={keepFocus}
        className={`z-10 overflow-hidden rounded-xl border border-green-200 bg-white shadow-md data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in-up ${matchAnchorWidth ? 'w-(--radix-popover-trigger-width)' : ''}`}
      >
        <div className="flex max-h-48 flex-col overflow-y-auto">{children}</div>
      </Popover.Content>
    </Popover.Portal>
  );
}
