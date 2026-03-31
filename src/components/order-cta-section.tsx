import { ArrowRight } from "lucide-react";

export function OrderCtaSection() {
  return (
    <section id="order" className="container-shell mt-16 sm:mt-20">
      <div className="overflow-hidden rounded-[2rem] bg-[#111827] px-6 py-10 text-white shadow-[0_30px_80px_rgba(17,24,39,0.18)] sm:px-8 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b07d]">Car on order</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Car on order delivered to your door.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
            Leave a request and use the ENCAR-backed feed as your starting point. The layout now follows the same persuasive structure as the reference: premium headline, direct CTA, and clear next action.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 lg:mt-0 lg:items-end">
          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f4e7d7]"
            href="#inventory"
          >
            Order a car
            <ArrowRight className="size-4" />
          </a>
          <p className="text-sm text-white/55">Start with the current catalog and jump to the original ENCAR listing when needed.</p>
        </div>
      </div>
    </section>
  );
}
