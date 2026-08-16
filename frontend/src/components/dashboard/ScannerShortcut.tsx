export default function ScannerShortcut() {
  return (
    <button
      className="w-full flex items-center justify-center gap-3 bg-green-1000 hover:bg-green-500 active:bg-green-500 text-white font-semibold rounded-2xl py-4 shadow-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
      aria-label="Ouvrir le scanner de code-barre"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
        <line x1="8" y1="12" x2="8" y2="12.01" strokeWidth={3} />
        <line x1="12" y1="12" x2="16" y2="12" strokeWidth={2} />
      </svg>
      Scanner un produit
    </button>
  );
}
