import { useCallback, useId, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';

const MAX_WIDTH_CLASS = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

interface BaseDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
  headerActions?: ReactNode;
  onClose?: () => void;
  onDialogNode?: (node: HTMLDialogElement | null) => void;
  children: ReactNode;
}

export function BaseDialog({
  dialogRef,
  title,
  maxWidth = 'lg',
  headerActions,
  onClose,
  onDialogNode,
  children,
}: BaseDialogProps) {
  const titleId = useId();

  const setRefs = useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      onDialogNode?.(node);
    },
    [dialogRef, onDialogNode],
  );

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={setRefs}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeDialog();
        }
      }}
      className={`dialog-fade m-auto w-[calc(100vw-2rem)] ${MAX_WIDTH_CLASS[maxWidth]} overflow-hidden rounded-2xl border-none bg-white p-0 shadow-lg backdrop:backdrop-blur-sm ios-typing:mt-[calc(var(--visible-top)+1rem)] ios-typing:mb-auto`}
    >
      <div className="flex max-h-[calc(100dvh-3rem)] flex-col gap-5 overflow-y-auto p-4 sm:p-6 ios-typing:max-h-[calc(var(--visible-height)-2rem)]">
        <div className="flex items-center justify-between gap-3">
          <h3
            id={titleId}
            className="min-w-0 truncate text-lg font-bold text-green-800"
          >
            {title}
          </h3>
          <div className="flex shrink-0 items-center gap-3">
            {headerActions}
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Fermer"
              className="cursor-pointer text-green-400 transition-colors hover:text-green-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {children}
      </div>
    </dialog>
  );
}
