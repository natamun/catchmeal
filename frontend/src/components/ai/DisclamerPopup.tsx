import { X } from 'lucide-react';

type DisclamerPopupProps = {
  setDisclamer: (x: boolean) => void;
};

export default function DisclamerPopup({ setDisclamer }: DisclamerPopupProps) {
  return (
    <div className="mt-15 h-75 flex-1 overflow-y-auto rounded-xl bg-gray-100 sm:mx-4">
      <div className="m-3 flex flex-row justify-between pt-2">
        <h3 className="flex justify-center font-bold">
          Avertissement important
        </h3>
        <button
          className="flex font-bold hover:text-gray-500"
          onClick={() => setDisclamer(false)}
        >
          <X height={20} width={20} />
        </button>
      </div>
      <p className="p-3 text-sm">
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
