/** Truck-art inspired badge — “Bringing India to You” */
export function BringingIndiaBanner() {
  return (
    <div className="bringing-banner relative overflow-hidden rounded-2xl bg-[color:var(--navy)] px-5 py-8 text-center shadow-xl sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[color:var(--saffron)] via-white to-[color:var(--india-green)]" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-[color:var(--india-green)] via-white to-[color:var(--saffron)]" />
      </div>
      <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--saffron)]">
        IndiRoute spirit
      </p>
      <h2 className="bringing-title relative mt-2 font-serif text-2xl font-bold tracking-wide text-white sm:text-4xl">
        BRINGING INDIA TO YOU
      </h2>
      <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/75">
        Shop Indian marketplaces. We handle the India warehouse, consolidation, and Australia
        delivery — with premium care.
      </p>
      <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-[color:var(--saffron)] px-3 py-1 font-bold text-[#0a1b30]">
          Truck-art energy
        </span>
        <span className="rounded-full bg-[color:var(--india-green)] px-3 py-1 font-bold text-white">
          India origin
        </span>
        <span className="rounded-full bg-white/15 px-3 py-1 font-bold text-white">
          AU Beta lane
        </span>
      </div>
    </div>
  );
}
