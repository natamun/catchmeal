import { X } from 'lucide-react';

type DisclamerPopupProps = {
  setDisclamer: (x: boolean) => void;
};

export default function DisclamerPopup({ setDisclamer }: DisclamerPopupProps) {
  return (
    <div className="max-h-full w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-green-800">
          Avertissement important
        </h3>
        <button
          type="button"
          onClick={() => setDisclamer(false)}
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
