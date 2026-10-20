import { BatteryFull, Signal, Wifi } from 'lucide-react';

import homeScreenshot from '../../assets/home-screenshot.webp';

/**
 * Phone drawn in CSS on the landing page, showing the app's home page. A status
 * bar and a home indicator frame the screenshot, as on a real phone, so the
 * rounded corners only clip background.
 */
export function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute h-72 w-72 animate-breathe rounded-full bg-green-300/60 blur-3xl motion-reduce:animate-none lg:h-96 lg:w-96"
        aria-hidden="true"
      />
      <div className="relative w-57 lg:w-66">
        <span className="absolute top-[19%] -left-0.5 h-[5%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[28%] -left-0.5 h-[9%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[41%] -left-0.5 h-[9%] w-1 rounded-l bg-green-700" />
        <span className="absolute top-[32%] -right-0.5 h-[13%] w-1 rounded-r bg-green-700" />
        <div className="relative rounded-[2.25rem] bg-green-800 p-2 shadow-2xl ring-1 ring-green-600">
          <div className="overflow-hidden rounded-[1.75rem] bg-green-50">
            <div
              className="relative flex aspect-8/1 items-center justify-between px-[10%] text-[0.6rem] font-semibold"
              aria-hidden="true"
            >
              <span>9:41</span>
              <span className="absolute top-1/2 left-1/2 h-[60%] w-[32%] -translate-1/2 rounded-full bg-green-800" />
              <span className="flex items-center gap-0.5">
                <Signal className="size-2.5" />
                <Wifi className="size-2.5" />
                <BatteryFull className="size-3" />
              </span>
            </div>
            <img
              src={homeScreenshot}
              alt="Écran d'accueil de CatCHMeal : calories du jour, macronutriments, poids et repas"
              width={720}
              height={1394}
              className="w-full"
            />
            <div
              className="flex aspect-12/1 items-center justify-center bg-white"
              aria-hidden="true"
            >
              <span className="h-1 w-1/3 rounded-full bg-green-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
