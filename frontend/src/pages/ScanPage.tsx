export default function ScanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M8 12h8"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-green-800">Scanner un produit</h2>
      <p className="text-sm text-green-500 max-w-xs leading-relaxed">
        Pointez votre caméra sur un code-barre pour obtenir les informations
        nutritionnelles instantanément.
      </p>
      <button
        className="mt-2 bg-green-1000 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
        aria-label="Ouvrir la caméra pour scanner un code-barre"
      >
        Ouvrir la caméra
      </button>
      <div className="w-full max-w-sm mt-6">
        <p className="text-xs text-green-500 mb-3" id="barcode-label">
          Ou saisissez un code-barre manuellement
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex : 7610200045018"
            aria-labelledby="barcode-label"
            aria-label="Code-barre"
            className="flex-1 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 focus-visible:outline-2 focus-visible:outline-green-400 bg-white"
          />
          <button
            className="bg-green-500 hover:bg-green-50 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer text-sm focus-visible:outline-2 focus-visible:outline-green-700 focus-visible:outline-offset-2"
            aria-label="Rechercher le produit par code-barre"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
