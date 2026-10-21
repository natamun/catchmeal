import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

type DisclaimerPopupProps = {
  setDisclaimer: (x: boolean) => void;
};

/**
 * The assistant's health warning, opened from its info button: it gives
 * information, not medical advice. Uses a native <dialog> for focus trap and
 * Escape key support.
 */
export function DisclaimerPopup({ setDisclaimer }: DisclaimerPopupProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const close = () => {
    dialogRef.current?.close();
    setDisclaimer(false);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={close}
      className="m-auto max-h-full w-full max-w-sm overflow-y-auto rounded-2xl border-none bg-white p-5 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 id={titleId} className="text-lg font-bold text-green-800">
          Avertissement important
        </h3>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="cursor-pointer text-green-400 transition-colors hover:text-green-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-sm text-green-600">
        Cet assistant utilise l'intelligence artificielle à des fins
        d'information et d'éducation en matière de nutrition. Il n'est ni un
        professionnel de santé ni un médecin, et ne fournit ni diagnostics, ni
        traitements, ni conseils médicaux. Consultez toujours un professionnel
        de santé avant d'apporter des changements radicaux à votre régime
        alimentaire.
      </p>
    </dialog>
  );
}
