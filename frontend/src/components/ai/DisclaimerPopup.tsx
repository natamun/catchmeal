import { X } from 'lucide-react';

type DisclaimerPopupProps = {
  setDisclaimer: (x: boolean) => void;
};

/**
 * The assistant's health warning, opened from its info button: it gives
 * information, not medical advice.
 */
export function DisclaimerPopup({ setDisclaimer }: DisclaimerPopupProps) {
  return (
    <div className="max-h-full w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-green-800">
          Avertissement important
        </h3>
        <button
          type="button"
          onClick={() => setDisclaimer(false)}
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
    </div>
  );
}
