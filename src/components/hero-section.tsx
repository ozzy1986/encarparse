/* eslint-disable @next/next/no-img-element */

import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";

import { formatKrw, formatMileageKm, formatUpdatedAt } from "@/lib/formatters";
import type { HomePageCar, HomePageStats } from "@/lib/server/homepage";

interface HeroSectionProps {
  stats: HomePageStats;
  featuredMakes: string[];
  previewCar: HomePageCar | null;
}

function formatHeroCount(value: number) {
  return value.toLocaleString("en-US").replace(/,/g, " ");
}

export function HeroSection({ featuredMakes, previewCar, stats }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[#0d1117]" />
      {previewCar?.photoUrl ? (
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          <img
            alt={previewCar.title}
            className="h-full w-full object-cover opacity-30"
            loading="eager"
            src={previewCar.photoUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0d1117]/10 via-[#0d1117]/70 to-[#0d1117]" />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,164,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(184,128,68,0.12),transparent_20%)]" />

      <div className="container-shell relative z-10 pb-24 pt-6 sm:pt-8 lg:pb-32">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">ENCARPARSE</p>
            <p className="mt-2 text-lg font-semibold">Premium ENCAR vehicle sourcing</p>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a className="transition hover:text-white" href="#inventory">
              Cars
            </a>
            <a className="transition hover:text-white" href="#services">
              Services
            </a>
            <a className="transition hover:text-white" href="#about">
              About Us
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/65 sm:inline-flex">
              KRW
            </span>
            <a
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#f6e8d8]"
              href="#inventory"
            >
              Contact us
              <ChevronRight className="size-4" />
            </a>
          </div>
        </header>

        <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(350px,0.95fr)] lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d5b48b]/30 bg-[#d5b48b]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#f5d7b3]">
              Daily synced from ENCAR
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[4.5rem] lg:leading-[0.98]">
              Premium service for the search and delivery of ENCAR vehicles.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              A more editorial, filter-first catalog inspired by <a className="underline decoration-white/20 underline-offset-4 hover:text-white" href="https://millionmiles.ae/" rel="noreferrer" target="_blank">Million Miles</a>, with daily updates, source-backed listings, and a luxury dealership browsing rhythm.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d4a66a] px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#e0b57d]"
                href="#inventory"
              >
                Browse inventory
                <ArrowRight className="size-4" />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
                href="#order"
              >
                Order a car
              </a>
            </div>

            <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-semibold text-white sm:text-4xl">{formatHeroCount(stats.totalCars)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/50">Cars synced</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white sm:text-4xl">{formatHeroCount(stats.brandCount)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/50">Brands tracked</p>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 text-white/80">
                  <Clock3 className="size-4 text-[#d4a66a]" />
                  <p className="text-xl font-semibold text-white sm:text-2xl">{formatUpdatedAt(stats.lastSyncedAt)}</p>
                </div>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/50">Refresh cadence</p>
              </div>
            </div>

            {featuredMakes.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {featuredMakes.map((make) => (
                  <span
                    key={make}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/70"
                  >
                    {make}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative lg:justify-self-end">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="relative h-[320px] sm:h-[380px]">
                {previewCar?.photoUrl ? (
                  <img alt={previewCar.title} className="h-full w-full object-cover" src={previewCar.photoUrl} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#151c27] text-white/45">Awaiting hero image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/20 to-transparent" />
              </div>
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#f1c48a]">
                  <span>{previewCar?.category ?? "Featured car"}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>Featured card</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {previewCar?.title ?? "Inventory updates are on the way"}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <span>{previewCar ? previewCar.year : "--"}</span>
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span>{previewCar ? formatMileageKm(previewCar.mileageKm) : "No mileage yet"}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">Asking price</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {previewCar ? formatKrw(previewCar.priceKrw) : "Unavailable"}
                    </p>
                  </div>
                  {previewCar ? (
                    <a
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/6"
                      href={previewCar.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open listing
                      <ArrowRight className="size-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
