import { CarGrid } from "@/components/car-grid";
import { HeroSection } from "@/components/hero-section";
import { getHomepageData } from "@/lib/server/homepage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <main className="pb-20">
      <HeroSection
        featuredMakes={data.featuredMakes}
        previewCar={data.cars[0] ?? null}
        stats={data.stats}
      />
      <CarGrid cars={data.cars} />
    </main>
  );
}
