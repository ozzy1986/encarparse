/* eslint-disable @next/next/no-img-element */

import { ArrowRight, CarFront, Clock3, Gauge, Sparkles } from "lucide-react";

import { formatKrw, formatMileageKm, formatUpdatedAt } from "@/lib/formatters";
import type { HomePageCar, HomePageStats } from "@/lib/server/homepage";

interface HeroSectionProps {
  stats: HomePageStats;
  featuredMakes: string[];
  previewCar: HomePageCar | null;
}

export function HeroSection({ featuredMakes, previewCar, stats }: HeroSectionProps) {
  return (
    <section className="container-shell pt-6 sm:pt-8 lg:pt-10">
      <div className="surface-card grid gap-8 overflow-hidden rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:px-10 lg:py-10">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
            <Sparkles className="size-3.5" />
            Daily synced from ENCAR
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Modern car inventory with a fast ENCAR sync pipeline.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Responsive landing experience, clean catalog cards, and structured vehicle data refreshed once per day.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#inventory"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
            >
              Browse inventory
              <ArrowRight className="size-4" />
            </a>
            <a
              href="https://www.encar.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/5"
            >
              Visit original marketplace
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-sky-400/10 p-2 text-sky-200">
                <CarFront className="size-4" />
              </div>
              <p className="text-2xl font-semibold text-white">{stats.totalCars.toLocaleString("en-US")}</p>
              <p className="mt-1 text-sm text-slate-400">Active vehicles</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-indigo-400/10 p-2 text-indigo-200">
                <Gauge className="size-4" />
              </div>
              <p className="text-2xl font-semibold text-white">{stats.brandCount.toLocaleString("en-US")}</p>
              <p className="mt-1 text-sm text-slate-400">Brands tracked</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-emerald-400/10 p-2 text-emerald-200">
                <Clock3 className="size-4" />
              </div>
              <p className="text-sm font-semibold text-white">{formatUpdatedAt(stats.lastSyncedAt)}</p>
              <p className="mt-1 text-sm text-slate-400">Last successful sync</p>
            </div>
          </div>

          {featuredMakes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {featuredMakes.map((make) => (
                <span
                  key={make}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300"
                >
                  {make}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative flex min-h-[320px] items-stretch">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-sky-400/15 via-indigo-500/10 to-transparent blur-3xl" />
          <div className="surface-card relative flex w-full flex-col justify-between rounded-[2rem] border-white/12 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Featured card preview</p>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/60">
                {previewCar?.photoUrl ? (
                  <img
                    alt={previewCar.title}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                    src={previewCar.photoUrl}
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-500">
                    No photo yet
                  </div>
                )}
              </div>
            </div>

            {previewCar ? (
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{previewCar.category ?? "Vehicle"}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{previewCar.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{previewCar.year}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{formatMileageKm(previewCar.mileageKm)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="text-xl font-semibold text-white">{formatKrw(previewCar.priceKrw)}</p>
                  <a
                    href={previewCar.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
                  >
                    Open listing
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/10 bg-black/10 p-5 text-sm text-slate-400">
                Run the ENCAR scraper once to populate the preview card and inventory grid.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
