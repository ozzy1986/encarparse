"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, RotateCcw, Search } from "lucide-react";

import { CarCard } from "@/components/car-card";
import type {
  HomePageCar,
  HomePageFilters,
  HomePageSelectedFilters,
  MakeCount,
} from "@/lib/server/homepage";

interface CarGridProps {
  cars: HomePageCar[];
  filters: HomePageFilters;
  makeCounts: MakeCount[];
  matchingCount: number;
  selectedFilters: HomePageSelectedFilters;
  page: number;
  pageCount: number;
}

function formatCountLabel(value: number) {
  return value.toLocaleString("en-US").replace(/,/g, " ");
}

export function CarGrid({
  cars,
  filters,
  makeCounts,
  matchingCount,
  selectedFilters,
  page,
  pageCount,
}: CarGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [brand, setBrand] = useState(selectedFilters.brand);
  const [model, setModel] = useState(selectedFilters.model);
  const [yearFrom, setYearFrom] = useState(selectedFilters.yearFrom);
  const [yearTo, setYearTo] = useState(selectedFilters.yearTo);
  const pageSize = selectedFilters.pageSize;

  const allModels = useMemo(
    () =>
      Array.from(new Set(Object.values(filters.modelsByBrand).flat())).sort((left, right) =>
        left.localeCompare(right),
      ),
    [filters.modelsByBrand],
  );

  const availableModels = brand ? filters.modelsByBrand[brand] ?? [] : allModels;
  const isDirty =
    brand !== selectedFilters.brand ||
    model !== selectedFilters.model ||
    yearFrom !== selectedFilters.yearFrom ||
    yearTo !== selectedFilters.yearTo;

  function applyFilters() {
    const params = new URLSearchParams();
    if (brand) {
      params.set("brand", brand);
    }
    if (model) {
      params.set("model", model);
    }
    if (yearFrom) {
      params.set("yearFrom", yearFrom);
    }
    if (yearTo) {
      params.set("yearTo", yearTo);
    }
    params.set("page", "1");
    if (pageSize) {
      params.set("pageSize", pageSize);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}#inventory` : `${pathname}#inventory`);
  }

  function goToPage(nextPage: number) {
    const safePage = Math.min(Math.max(1, Math.floor(nextPage)), Math.max(1, pageCount));
    const params = new URLSearchParams();
    if (selectedFilters.brand) {
      params.set("brand", selectedFilters.brand);
    }
    if (selectedFilters.model) {
      params.set("model", selectedFilters.model);
    }
    if (selectedFilters.yearFrom) {
      params.set("yearFrom", selectedFilters.yearFrom);
    }
    if (selectedFilters.yearTo) {
      params.set("yearTo", selectedFilters.yearTo);
    }
    params.set("page", String(safePage));
    if (selectedFilters.pageSize) {
      params.set("pageSize", selectedFilters.pageSize);
    }
    router.push(`${pathname}?${params.toString()}#inventory`);
  }

  function clearFilters() {
    setBrand("");
    setModel("");
    setYearFrom("");
    setYearTo("");
    router.push(`${pathname}#inventory`);
  }

  return (
    <section id="inventory" className="container-shell relative z-20 -mt-14 sm:-mt-18 lg:-mt-20">
      <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_35px_90px_rgba(24,18,8,0.16)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Find your next car</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#191512] sm:text-4xl">
              Search by brand, model, and year.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6c6258] sm:text-base">
              Every listing on this page is refreshed from ENCAR and presented with English brand and model naming for cleaner browsing.
            </p>
          </div>
          <div className="rounded-full bg-[#f5efe8] px-4 py-2 text-sm font-medium text-[#5f554b]">
            {formatCountLabel(matchingCount)} matching cars
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
            onClick={applyFilters}
            type="button"
          >
            <Search className="size-4" />
            {isDirty ? "Update search" : `Show ${matchingCount} cars`}
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
            {matchingCount === 0
              ? "No active listings match the current filters."
              : `Showing ${cars.length} cars on this page from ${matchingCount} matching active listings.`}
          </p>
          {matchingCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              <button
                className="rounded-full border border-[#ddd2c3] bg-white px-4 py-2 text-sm font-medium text-[#5d5348] transition hover:border-[#c9b8a5] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => goToPage(page - 1)}
                type="button"
                disabled={page <= 1}
              >
                Previous
              </button>
              <div className="rounded-full bg-[#f5efe8] px-4 py-2 text-sm font-medium text-[#5f554b]">
                Page {page} of {pageCount}
              </div>
              <button
                className="rounded-full border border-[#ddd2c3] bg-white px-4 py-2 text-sm font-medium text-[#5d5348] transition hover:border-[#c9b8a5] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => goToPage(page + 1)}
                type="button"
                disabled={page >= pageCount}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#e8dfd2] bg-[#fbf8f2] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Popular brands</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {makeCounts.map((item) => (
                <button
                  key={item.make}
                  type="button"
                  className="flex w-full items-baseline justify-between gap-4 border-b border-[#ece2d6] pb-3 text-left transition hover:border-[#c9b8a5] last:border-b-0 last:pb-0"
                  onClick={() => {
                    setBrand(item.make);
                    setModel("");
                    setYearFrom("");
                    setYearTo("");
                    const params = new URLSearchParams();
                    params.set("brand", item.make);
                    params.set("page", "1");
                    router.push(`${pathname}?${params.toString()}#inventory`);
                  }}
                >
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f1a16] transition group-hover:text-[#9a6531]">{item.make}</span>
                  <span className="text-sm text-[#8b7f72]">{formatCountLabel(item.count)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#111827] p-6 text-white shadow-[0_25px_70px_rgba(17,24,39,0.18)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d9b384]">Why buyers use this page</p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">Daily source updates with direct listing traceability.</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Every vehicle here links back to its original ENCAR page, while the catalog keeps the browsing experience simpler, faster, and easier to scan in English.
            </p>
            <a
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f6c58f] transition hover:text-white"
              href="https://www.encar.com/"
              rel="noreferrer"
              target="_blank"
            >
              Open ENCAR marketplace
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div id="inventory-grid">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Selected inventory</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
                Clean cards, direct pricing, and source-backed links.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6d6358] sm:text-base">
                Review the latest matching vehicles, compare key facts quickly, and open the original listing whenever you want full source detail.
              </p>
            </div>
            <div className="rounded-full border border-[#ddd3c7] bg-white px-4 py-2 text-sm font-medium text-[#5f554b]">
              {matchingCount} matching listings
            </div>
          </div>

          {cars.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d8cdbd] bg-white px-8 py-12 text-center shadow-[0_20px_55px_rgba(30,22,12,0.08)]">
              <p className="text-xl font-semibold text-[#171310]">No cars match these filters.</p>
              <p className="mt-3 text-sm leading-7 text-[#6d6358]">
                Reset the search to return to the latest active ENCAR inventory.
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
