import type { ComponentProps, ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';

interface DropdownPanelProps {
  container: HTMLElement | null;
  align?: 'start' | 'center' | 'end';
  matchAnchorWidth?: boolean;
  moveFocus?: boolean;
  fitViewport?: boolean;
  onInteractOutside?: ComponentProps<
    typeof Popover.Content
  >['onInteractOutside'];
  children: ReactNode;
}

/**
 * Floating list (Radix Popover) rendered inside `container`, usually the open
 * dialog, so it stays usable above a modal. Focus stays in the field that
 * opened it, so typing can go on, unless `moveFocus` is set. Its height is
 * capped, or fits the screen with `fitViewport`.
 */
export function DropdownPanel({
  container,
  align = 'start',
  matchAnchorWidth = false,
  moveFocus = false,
  fitViewport = false,
  onInteractOutside,
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
        onInteractOutside={onInteractOutside}
        className={`z-10 overflow-hidden rounded-xl border border-green-200 bg-white shadow-md data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in-up ${matchAnchorWidth ? 'w-(--radix-popover-trigger-width)' : ''}`}
      >
        <div
          className={`flex flex-col overflow-y-auto ${fitViewport ? 'max-h-(--radix-popover-content-available-height)' : 'max-h-48'}`}
        >
          {children}
        </div>
      </Popover.Content>
    </Popover.Portal>
  );
}
