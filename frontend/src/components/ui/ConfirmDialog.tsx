import { useId, type RefObject } from 'react';

interface ConfirmDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  tone?: 'danger' | 'primary';
}

const CONFIRM_TONE_CLASS = {
  danger: 'bg-red-500 hover:bg-red-600',
  primary: 'bg-green-500 hover:bg-green-600',
};

/**
 * "Are you sure?" dialog with Cancel and a confirm button, red by default or
 * green with tone="primary". While `isPending` the button is disabled and shows
 * `pendingLabel`.
 */
export function ConfirmDialog({
  dialogRef,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  tone = 'danger',
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="dialog-fade m-auto w-[calc(100vw-2rem)] max-w-sm rounded-2xl border-none bg-white p-6 shadow-lg backdrop:backdrop-blur-sm"
    >
      <h3 id={titleId} className="text-lg font-bold text-green-800">
        {title}
      </h3>
      <p id={descId} className="mt-2 text-sm text-green-500">
        {description}
      </p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="flex-1 cursor-pointer rounded-xl border border-green-200 px-4 py-2.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CONFIRM_TONE_CLASS[tone]}`}
        >
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
