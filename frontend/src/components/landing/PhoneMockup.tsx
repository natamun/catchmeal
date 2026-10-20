/** Phone drawn in CSS on the landing page, waiting for a real screenshot. */
export function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-72 w-72 animate-breathe rounded-full bg-green-300/60 blur-3xl motion-reduce:animate-none lg:h-96 lg:w-96"
        aria-hidden="true"
      />
      <div className="relative w-52 lg:w-60">
        <span className="absolute top-[19%] -left-0.5 h-[5%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[28%] -left-0.5 h-[9%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[41%] -left-0.5 h-[9%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[32%] -right-0.5 h-[13%] w-1 rounded-r bg-green-700" />
        <div className="relative aspect-9/19 rounded-[2.75rem] bg-green-800 p-1 shadow-2xl ring-1 ring-green-600">
          <div className="flex h-full items-center justify-center rounded-[2.5rem] bg-white text-sm text-green-600">
            Capture à venir
          </div>
        </div>
      </div>
    </div>
  );
}
