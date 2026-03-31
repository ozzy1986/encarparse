export function StorySection() {
  return (
    <section id="about" className="container-shell mt-16 sm:mt-20">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded-[2rem] border border-[#e4dacc] bg-[#fbf8f2] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Dealership-style story block</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
            A more editorial layout, not just a list of cards.
          </h2>
          <p className="mt-4 text-sm leading-8 text-[#675d53] sm:text-base">
            The reference site feels premium because every section supports the main sale: large hero, strong counts, a search module, supporting trust text, and service summaries. This homepage now follows that same flow instead of dropping visitors straight into a plain grid.
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(30,22,12,0.08)] sm:p-8">
          <blockquote className="text-2xl font-semibold leading-relaxed text-[#171310] sm:text-3xl">
            &ldquo;Million Miles works because it feels like a premium sourcing studio first and a catalog second. This version now follows that same UX logic much more closely.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[#8a7d70]">Homepage direction</p>
          <p className="mt-2 text-base text-[#5f554b]">Filter-first browsing, premium visual hierarchy, and supporting sections that add trust around the inventory.</p>
        </div>
      </div>
    </section>
  );
}
