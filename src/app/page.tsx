import { CarGrid } from "@/components/car-grid";
import { HeroSection } from "@/components/hero-section";
import { OrderCtaSection } from "@/components/order-cta-section";
import { ServicesSection } from "@/components/services-section";
import { StorySection } from "@/components/story-section";
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
  });

  return (
    <main className="pb-24">
      <HeroSection
        featuredMakes={data.featuredMakes}
        previewCar={data.cars[0] ?? null}
        stats={data.stats}
      />
      <CarGrid
        key={`${data.selectedFilters.brand}-${data.selectedFilters.model}-${data.selectedFilters.yearFrom}-${data.selectedFilters.yearTo}`}
        cars={data.cars}
        filters={data.filters}
        makeCounts={data.makeCounts}
        matchingCount={data.matchingCount}
        selectedFilters={data.selectedFilters}
      />
      <OrderCtaSection />
      <StorySection />
      <ServicesSection />
    </main>
  );
}
