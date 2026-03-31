import { CarCard } from "@/components/car-card";
import type { HomePageCar } from "@/lib/server/homepage";

interface CarGridProps {
  cars: HomePageCar[];
}

export function CarGrid({ cars }: CarGridProps) {
  return (
    <section id="inventory" className="container-shell mt-8 sm:mt-10 lg:mt-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Vehicle inventory</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Responsive ENCAR listing grid
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Each card exposes the key sale signals at a glance: hero image, model name, year, mileage, and price.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          {cars.length.toLocaleString("en-US")} vehicles on this page
        </div>
      </div>

      {cars.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-[1.75rem] border-dashed p-10 text-center text-slate-300">
          <p className="text-lg font-medium text-white">No vehicles synced yet.</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Run the daily scraper once and this landing page will immediately show the latest ENCAR inventory.
          </p>
        </div>
      )}
    </section>
  );
}
