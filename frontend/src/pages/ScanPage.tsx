export default function ScanPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
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
      <p className="max-w-xs text-sm leading-relaxed text-green-500">
        Pointez votre caméra sur un code-barre pour obtenir les informations
        nutritionnelles instantanément.
      </p>
      <button
        className="bg-green-1000 mt-2 cursor-pointer rounded-xl px-6 py-3 font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
        aria-label="Ouvrir la caméra pour scanner un code-barre"
      >
        Ouvrir la caméra
      </button>
      <div className="mt-6 w-full max-w-sm">
        <p className="mb-3 text-xs text-green-500" id="barcode-label">
          Ou saisissez un code-barre manuellement
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex : 7610200045018"
            aria-labelledby="barcode-label"
            aria-label="Code-barre"
            className="flex-1 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 outline-none focus:border-green-400 focus-visible:outline-2 focus-visible:outline-green-400"
          />
          <button
            className="cursor-pointer rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            aria-label="Rechercher le produit par code-barre"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
