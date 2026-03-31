/* eslint-disable @next/next/no-img-element */

import { ArrowUpRight, CalendarRange, Coins, Gauge } from "lucide-react";

import { formatKrw, formatMileageKm } from "@/lib/formatters";
import type { HomePageCar } from "@/lib/server/homepage";

interface CarCardProps {
  car: HomePageCar;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[#e6ddcf] bg-white shadow-[0_28px_75px_rgba(30,22,12,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(30,22,12,0.13)]">
      <div className="relative overflow-hidden bg-[#ece5db]">
        {car.photoUrl ? (
          <img
            alt={car.title}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            src={car.photoUrl}
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-gradient-to-br from-[#ece5db] to-[#d8c9b4] text-[#7c7062]">
            Photo unavailable
          </div>
        )}
        <div className="absolute left-5 top-5 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          {car.category ?? "Vehicle"}
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a36b32]">{car.make}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#171310]">{car.title}</h3>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-[#5f554b]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f2eb] px-3 py-1.5">
            <CalendarRange className="size-4 text-[#7c6144]" />
            {car.year}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f2eb] px-3 py-1.5">
            <Gauge className="size-4 text-[#7c6144]" />
            {formatMileageKm(car.mileageKm)}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-[#efe6d9] pt-5">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7d70]">
              <Coins className="size-4 text-[#a36b32]" />
              Price
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#171310]">{formatKrw(car.priceKrw)}</p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
            href={car.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            View car
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
