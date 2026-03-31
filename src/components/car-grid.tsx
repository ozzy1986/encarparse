"use client";

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw, Search } from "lucide-react";

import { CarCard } from "@/components/car-card";
import type { HomePageCar, HomePageFilters, MakeCount } from "@/lib/server/homepage";

interface CarGridProps {
  cars: HomePageCar[];
  filters: HomePageFilters;
  makeCounts: MakeCount[];
}

function formatCountLabel(value: number) {
  return value.toLocaleString("en-US").replace(/,/g, " ");
}

export function CarGrid({ cars, filters, makeCounts }: CarGridProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const allModels = useMemo(
    () =>
      Array.from(new Set(Object.values(filters.modelsByBrand).flat())).sort((left, right) =>
        left.localeCompare(right),
      ),
    [filters.modelsByBrand],
  );

  const availableModels = brand ? filters.modelsByBrand[brand] ?? [] : allModels;

  const filteredCars = useMemo(() => {
    const fromYear = yearFrom ? Number(yearFrom) : null;
    const toYear = yearTo ? Number(yearTo) : null;

    return cars.filter((car) => {
      if (brand && car.make !== brand) {
        return false;
      }
      if (model && car.model !== model) {
        return false;
      }
      if (fromYear !== null && car.year < fromYear) {
        return false;
      }
      if (toYear !== null && car.year > toYear) {
        return false;
      }
      return true;
    });
  }, [brand, cars, model, yearFrom, yearTo]);

  function clearFilters() {
    setBrand("");
    setModel("");
    setYearFrom("");
    setYearTo("");
  }

  function jumpToInventory() {
    document.getElementById("inventory-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="inventory" className="container-shell relative z-20 -mt-14 sm:-mt-18 lg:-mt-20">
      <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_35px_90px_rgba(24,18,8,0.16)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Find your dream car</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#191512] sm:text-4xl">
              Search-first browsing, just like a premium dealership landing.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6c6258] sm:text-base">
              Filter the live ENCAR feed by brand, model, and production year, then jump straight into the inventory grid below.
            </p>
          </div>
          <div className="rounded-full bg-[#f5efe8] px-4 py-2 text-sm font-medium text-[#5f554b]">
            {formatCountLabel(filteredCars.length)} matching cars
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6457]">Brand</span>
            <select
              className="w-full rounded-2xl border border-[#e4dbcf] bg-[#fbf9f5] px-4 py-3 text-sm text-[#171717] outline-none transition focus:border-[#c89252]"
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setModel("");
              }}
            >
              <option value="">All brands</option>
              {filters.brands.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6457]">Model</span>
            <select
              className="w-full rounded-2xl border border-[#e4dbcf] bg-[#fbf9f5] px-4 py-3 text-sm text-[#171717] outline-none transition focus:border-[#c89252]"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="">All models</option>
              {availableModels.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6457]">Year from</span>
            <select
              className="w-full rounded-2xl border border-[#e4dbcf] bg-[#fbf9f5] px-4 py-3 text-sm text-[#171717] outline-none transition focus:border-[#c89252]"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value)}
            >
              <option value="">Any year</option>
              {filters.years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6457]">Year to</span>
            <select
              className="w-full rounded-2xl border border-[#e4dbcf] bg-[#fbf9f5] px-4 py-3 text-sm text-[#171717] outline-none transition focus:border-[#c89252]"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value)}
            >
              <option value="">Any year</option>
              {filters.years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
            onClick={jumpToInventory}
            type="button"
          >
            <Search className="size-4" />
            Show {filteredCars.length} cars
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#eee4d7] pt-6">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#ddd2c3] px-4 py-2 text-sm font-medium text-[#5d5348] transition hover:border-[#c9b8a5] hover:bg-[#faf7f2]"
            onClick={clearFilters}
            type="button"
          >
            <RotateCcw className="size-4" />
            Reset filters
          </button>
          <p className="text-sm text-[#6c6258]">
            {filteredCars.length === cars.length
              ? "Showing the latest active ENCAR inventory on this landing page."
              : `Showing ${filteredCars.length} of ${cars.length} cars loaded on this page.`}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#e8dfd2] bg-[#fbf8f2] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Popular makes</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {makeCounts.map((item) => (
                <div key={item.make} className="flex items-baseline justify-between gap-4 border-b border-[#ece2d6] pb-3 last:border-b-0 last:pb-0">
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f1a16]">{item.make}</span>
                  <span className="text-sm text-[#8b7f72]">{formatCountLabel(item.count)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#111827] p-6 text-white shadow-[0_25px_70px_rgba(17,24,39,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d9b384]">Why this feels closer</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">Filter-first discovery and stronger dealership storytelling.</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              The reference page works because the search block arrives early, the brand rail reinforces inventory breadth, and every section feels like part of one premium browsing story.
            </p>
            <a
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f6c58f] transition hover:text-white"
              href="#services"
            >
              Explore service sections
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div id="inventory-grid">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Selected inventory</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
                A cleaner card grid with more of the Million Miles rhythm.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d6358] sm:text-base">
                Bigger imagery, simpler data groupings, and clearer calls to action make the listing area feel much closer to a premium dealership showcase.
              </p>
            </div>
            <div className="rounded-full border border-[#ddd3c7] bg-white px-4 py-2 text-sm font-medium text-[#5f554b]">
              {filteredCars.length} cars shown
            </div>
          </div>

          {filteredCars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d8cdbd] bg-white px-8 py-12 text-center shadow-[0_20px_55px_rgba(30,22,12,0.08)]">
              <p className="text-xl font-semibold text-[#171310]">No cars match these filters.</p>
              <p className="mt-3 text-sm leading-7 text-[#6d6358]">
                Reset the filters and browse the most recent ENCAR listings again.
              </p>
              <button
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
                onClick={clearFilters}
                type="button"
              >
                <RotateCcw className="size-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
