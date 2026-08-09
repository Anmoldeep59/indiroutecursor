const items = [
  { title: "Textiles", blurb: "Sarees, apparel & fabrics from Indian marketplaces" },
  { title: "Handicrafts", blurb: "Artisan goods packed with care at our India locker" },
  { title: "Spices & pantry", blurb: "Regional flavours consolidated into one outbound box" },
  { title: "Electronics", blurb: "Gadgets inspected on receive with exterior photos" },
];

export function IndiaCraftStrip() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--navy-deep)] py-14 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,103,31,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(4,106,56,0.2), transparent 45%)",
        }}
      />
      <div className="relative mx-auto max-w-[1140px] px-4 md:px-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
              Indian craft & cargo
            </p>
            <h2 className="mt-2 text-3xl font-bold">What Indians ship — and you can too</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              From marketplace parcels to carefully packed exports. We receive at the India
              warehouse, photograph, store, and forward to Australia.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-[color:var(--india-green)]" />
            Inspected · Photographed · Forwarded
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[color:var(--saffron)]/50 hover:bg-white/10"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[color:var(--navy)] ring-1 ring-white/10">
                <CraftIcon index={i} />
              </div>
              <p className="font-bold text-white">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{item.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftIcon({ index }: { index: number }) {
  const stroke = "#ff671f";
  if (index === 0) {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <path d="M6 10h20v14H6z" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M6 14h20M16 14v10" stroke="#046a38" strokeWidth="2" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <circle cx="16" cy="16" r="9" fill="none" stroke={stroke} strokeWidth="2" />
        <path d="M16 8v16M8 16h16" stroke="#1b4f9c" strokeWidth="1.5" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <path d="M8 22c0-6 4-12 8-14 4 2 8 8 8 14" fill="none" stroke={stroke} strokeWidth="2" />
        <ellipse cx="16" cy="22" rx="8" ry="3" fill="none" stroke="#046a38" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <rect x="8" y="10" width="16" height="12" rx="2" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="16" cy="16" r="3" fill="#1b4f9c" />
    </svg>
  );
}
