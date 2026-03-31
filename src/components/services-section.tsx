import { ArrowRight, BadgeDollarSign, CarFront, FileCheck2, ShieldCheck, Sparkles, Truck, WalletCards, Wrench } from "lucide-react";

const services = [
  {
    title: "Find a Car",
    description: "Use the ENCAR feed as a premium search surface with strong filters and quick access to source listings.",
    icon: CarFront,
  },
  {
    title: "Sell a Car",
    description: "Pair inventory discovery with an editorial section that feels closer to a dealership landing than a data dump.",
    icon: BadgeDollarSign,
  },
  {
    title: "Import & Export",
    description: "Keep the reference site feel by presenting logistics and sourcing as part of the same premium journey.",
    icon: Truck,
  },
  {
    title: "Logistics Services",
    description: "Support the catalog with service-oriented storytelling instead of leaving the page as a single-section grid.",
    icon: FileCheck2,
  },
  {
    title: "Registration",
    description: "Use utility sections to reassure visitors that the catalog is backed by a real process and clear next steps.",
    icon: ShieldCheck,
  },
  {
    title: "Get Insurance",
    description: "The supporting cards help the page feel premium and complete, just like the Million Miles layout.",
    icon: WalletCards,
  },
  {
    title: "Buy on Lease",
    description: "A dealership-style landing works best when services are part of the browse flow, not hidden elsewhere.",
    icon: Sparkles,
  },
  {
    title: "Service & Detailing",
    description: "Rounded cards, lighter surfaces, and concise service blurbs complete the new premium visual system.",
    icon: Wrench,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="container-shell mt-16 sm:mt-20">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Our services</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
            Supporting sections that make the homepage feel complete.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-[#675d53] sm:text-base">
          This section mirrors the reference site?s service grid so the page reads like a premium automotive business, not only a scraping demo.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article
              key={service.title}
              className="rounded-[1.75rem] border border-[#e5dccf] bg-white p-6 shadow-[0_20px_55px_rgba(30,22,12,0.07)]"
            >
              <div className="inline-flex rounded-2xl bg-[#f5efe8] p-3 text-[#9a6531]">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[#171310]">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#675d53]">{service.description}</p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9a6531] transition hover:text-[#171310]"
                href="#inventory"
              >
                Learn more
                <ArrowRight className="size-4" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
