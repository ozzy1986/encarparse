import { ArrowRight } from "lucide-react";

export function OrderCtaSection() {
  return (
    <section id="order" className="container-shell mt-16 sm:mt-20">
      <div className="overflow-hidden rounded-[2rem] bg-[#111827] px-6 py-10 text-white shadow-[0_30px_80px_rgba(17,24,39,0.18)] sm:px-8 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b07d]">Need a closer look?</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Shortlist the right car here, then open the original ENCAR listing.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
            This page is designed to make the first pass easier: cleaner search, simpler cards, and direct access to the source listing for final review.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 lg:mt-0 lg:items-end">
          <a
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f4e7d7]"
            href="#inventory"
          >
            Browse inventory
            <ArrowRight className="size-4" />
          </a>
          <a className="text-sm text-white/55 transition hover:text-white" href="https://www.encar.com/" rel="noreferrer" target="_blank">
            Open the full ENCAR marketplace
          </a>
        </div>
      </div>
    </section>
  );
}
