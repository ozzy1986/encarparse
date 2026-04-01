import { CarGrid } from "@/components/car-grid";
import { HeroSection } from "@/components/hero-section";
import { getHomepageData } from "@/lib/server/homepage";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const data = await getHomepageData({
    brand: firstParam(resolvedSearchParams.brand),
    model: firstParam(resolvedSearchParams.model),
    yearFrom: firstParam(resolvedSearchParams.yearFrom),
    yearTo: firstParam(resolvedSearchParams.yearTo),
    page: firstParam(resolvedSearchParams.page),
    pageSize: firstParam(resolvedSearchParams.pageSize),
  });

  return (
    <>
      <main className="pb-24">
        <HeroSection
          featuredMakes={data.featuredMakes}
          previewCar={data.cars[0] ?? null}
          stats={data.stats}
        />
        <CarGrid
          key={`${data.selectedFilters.brand}-${data.selectedFilters.model}-${data.selectedFilters.yearFrom}-${data.selectedFilters.yearTo}-${data.selectedFilters.page}-${data.selectedFilters.pageSize}`}
          cars={data.cars}
          filters={data.filters}
          makeCounts={data.makeCounts}
          matchingCount={data.matchingCount}
          selectedFilters={data.selectedFilters}
          page={data.page}
          pageCount={data.pageCount}
        />
      </main>
      <footer className="border-t border-[#e4dacc] bg-[#fbf8f2] py-8">
        <div className="container-shell flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-[#8b7f72]">
            Data sourced daily from{" "}
            <a className="font-medium text-[#9a6531] transition hover:text-[#171310]" href="https://www.encar.com/" rel="noreferrer" target="_blank">
              ENCAR
            </a>
          </p>
          <a className="text-sm font-medium text-[#9a6531] transition hover:text-[#171310]" href="#inventory">
            Back to top
          </a>
        </div>
      </footer>
    </>
  );
}
