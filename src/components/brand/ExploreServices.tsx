import Link from "next/link";

const services = [
  {
    title: "Shop & Ship",
    body: "Get your India warehouse address, shop Flipkart, Myntra, Amazon IN & more — we receive, photograph, and store.",
    href: "/signup",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <path d="M4 7h16l-1.5 12h-13L4 7z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    cta: "Get My India Address",
  },
  {
    title: "Consolidate",
    body: "Combine multiple Indian parcels into one outbound box. 20 free storage days help you shop smarter.",
    href: "/how-it-works",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <rect x="3" y="8" width="8" height="8" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="8" width="8" height="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M11 12h2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    cta: "See how it works",
  },
  {
    title: "Ship to Australia",
    body: "AUD quotes from warehouse measurements, Stripe checkout, manual courier booking for Beta reliability.",
    href: "/shipping-calculator",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <path d="M3 16h18M5 16V9l6-3 6 3v7" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8" cy="17.5" r="1.5" fill="currentColor" />
        <circle cx="16" cy="17.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    cta: "Calculate shipping",
  },
];

export function ExploreServices() {
  return (
    <section className="bg-[color:var(--wash)] py-14">
      <div className="mx-auto max-w-[1140px] px-4 md:px-5">
        <h2 className="text-center text-3xl font-bold text-[color:var(--ink)]">
          Explore Our Services
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[color:var(--ink-soft)]">
          Built for India → Australia Beta. No wallet. No loyalty points. Real parcels.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="service-card group relative overflow-hidden rounded-2xl p-7 text-center text-white shadow-lg"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="service-card-shine pointer-events-none absolute inset-0" aria-hidden />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[color:var(--saffron)] ring-4 ring-[color:var(--saffron)]/70">
                {s.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">{s.body}</p>
              <Link href={s.href} className="sp-btn-orange mt-6 !px-4 !py-2 !text-sm !font-bold">
                {s.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
