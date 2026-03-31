export function StorySection() {
  return (
    <section id="about" className="container-shell mt-16 sm:mt-20">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded-[2rem] border border-[#e4dacc] bg-[#fbf8f2] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b77a38]">Why this catalog exists</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#171310] sm:text-4xl">
            ENCAR data, presented with cleaner structure and clearer labels.
          </h2>
          <p className="mt-4 text-sm leading-8 text-[#675d53] sm:text-base">
            The site keeps the source intact while presenting vehicle information in a simpler English-first layout. Buyers can scan the essentials quickly without losing the ability to verify every car at the source.
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_60px_rgba(30,22,12,0.08)] sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8a7d70]">What you can expect</p>
          <ul className="mt-5 space-y-4 text-base leading-8 text-[#5f554b]">
            <li>English brand, model, and title presentation for customer-facing browsing.</li>
            <li>Daily ENCAR sync with direct links to the original listing pages.</li>
            <li>A simpler visual hierarchy for faster review of year, mileage, and price.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
