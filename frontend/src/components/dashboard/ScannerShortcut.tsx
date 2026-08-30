export default function ScannerShortcut() {
  return (
    <button
      className="bg-green-1000 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-white shadow-sm transition-colors hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 active:bg-green-500"
      aria-label="Ouvrir le scanner de code-barre"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
        />
        <line x1="8" y1="12" x2="8" y2="12.01" strokeWidth={3} />
        <line x1="12" y1="12" x2="16" y2="12" strokeWidth={2} />
      </svg>
      Scanner un produit
    </button>
  );
}
