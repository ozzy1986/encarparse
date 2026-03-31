import { CarGrid } from "@/components/car-grid";
import { HeroSection } from "@/components/hero-section";
import { OrderCtaSection } from "@/components/order-cta-section";
import { ServicesSection } from "@/components/services-section";
import { StorySection } from "@/components/story-section";
import { getHomepageData } from "@/lib/server/homepage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <main className="pb-24">
      <HeroSection
        featuredMakes={data.featuredMakes}
        previewCar={data.cars[0] ?? null}
        stats={data.stats}
      />
      <CarGrid cars={data.cars} filters={data.filters} makeCounts={data.makeCounts} />
      <OrderCtaSection />
      <StorySection />
      <ServicesSection />
    </main>
  );
}
