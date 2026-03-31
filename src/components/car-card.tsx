/* eslint-disable @next/next/no-img-element */

import { ArrowUpRight, CalendarRange, Coins, Gauge } from "lucide-react";

import { formatKrw, formatMileageKm } from "@/lib/formatters";
import type { HomePageCar } from "@/lib/server/homepage";

interface CarCardProps {
  car: HomePageCar;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <article className="surface-card group overflow-hidden rounded-[1.75rem] transition hover:-translate-y-1 hover:border-white/20">
      <div className="relative overflow-hidden border-b border-white/10 bg-slate-950/60">
        {car.photoUrl ? (
          <img
            alt={car.title}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            src={car.photoUrl}
          />
        ) : (
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-500">
            Photo unavailable
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 backdrop-blur">
          {car.category ?? "Vehicle"}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{car.make}</p>
          <h3 className="text-xl font-semibold text-white">{car.title}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 inline-flex rounded-xl bg-white/5 p-2 text-slate-200">
              <CalendarRange className="size-4" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Year</p>
            <p className="mt-1 font-medium text-white">{car.year}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 inline-flex rounded-xl bg-white/5 p-2 text-slate-200">
              <Gauge className="size-4" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mileage</p>
            <p className="mt-1 font-medium text-white">{formatMileageKm(car.mileageKm)}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
          <div>
            <div className="mb-2 inline-flex rounded-xl bg-emerald-400/10 p-2 text-emerald-200">
              <Coins className="size-4" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p>
            <p className="mt-1 text-2xl font-semibold text-white">{formatKrw(car.priceKrw)}</p>
          </div>
          <a
            href={car.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
          >
            View car
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
