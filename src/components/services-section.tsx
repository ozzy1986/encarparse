import { ArrowRight, CarFront, FileCheck2, Gauge, Search, Sparkles, TableProperties, WalletCards } from "lucide-react";

const tools = [
  {
    title: "Search by Brand",
    description: "Narrow the catalog quickly by normalized English brand names.",
    icon: Search,
  },
  {
    title: "Search by Model",
    description: "Review models with cleaner English naming instead of mixed-language raw listing text.",
    icon: CarFront,
  },
  {
    title: "Compare Mileage",
    description: "See mileage in a consistent format that is easy to compare across cards.",
    icon: Gauge,
  },
  {
    title: "Check Year Range",
    description: "Focus on a target production range without scanning every listing manually.",
    icon: TableProperties,
  },
  {
    title: "Review Price",
    description: "Surface asking prices clearly across both everyday and premium vehicle listings.",
    icon: WalletCards,
  },
  {
    title: "Verify at Source",
    description: "Every card links back to the original ENCAR listing for deeper review and validation.",
    icon: FileCheck2,
  },
  {
    title: "Track Daily Updates",
    description: "The catalog refreshes on a daily schedule so new arrivals are easy to monitor.",
    icon: Sparkles,
  },
  {
    title: "Scan Faster",
    description: "A clearer section flow makes the inventory easier to review quickly and confidently.",
    icon: ArrowRight,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="container-shell mt-16 sm:mt-20">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Catalog tools</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
            What this page helps you do.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[#675d53] sm:text-base">
          The goal is simple: make ENCAR inventory easier to search, easier to compare, and easier to validate.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article
              key={tool.title}
              className="rounded-[1.75rem] border border-[#e5dccf] bg-white p-6 shadow-[0_20px_55px_rgba(30,22,12,0.07)]"
            >
              <div className="inline-flex rounded-2xl bg-[#f5efe8] p-3 text-[#9a6531]">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#171310]">{tool.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#675d53]">{tool.description}</p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9a6531] transition hover:text-[#171310]"
                href="#inventory"
              >
                Open inventory
                <ArrowRight className="size-4" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
