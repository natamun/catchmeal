/**
 * Link to the Open Food Facts website, credited wherever their data is used.
 */
export function OpenFoodFactsLink() {
  return (
    <a
      href="https://world.openfoodfacts.org"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Food Facts (ouvre dans un nouvel onglet)"
      className="font-medium text-green-700 underline underline-offset-2 transition-colors hover:text-green-500"
    >
      Open Food Facts
    </a>
  );
}
