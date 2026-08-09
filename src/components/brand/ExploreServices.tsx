import Link from "next/link";

const services = [
  {
    title: "Personal Shopper",
    body: "Payment hassles at checkout? No worries! Hire one of our experts to shop for you once Assisted Purchase launches.",
    href: "/assisted-purchase",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    cta: "Learn more",
  },
  {
    title: "Shop & Ship",
    body: "Shop authentic Indian brands and ship to Australia — straight to your doorstep with consolidation & photos.",
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
    title: "Shipping Rates",
    body: "Estimate India → Australia rates. Final payable quotes use warehouse measurements only.",
    href: "/shipping-calculator",
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    cta: "Check Prices",
  },
];

export function ExploreServices() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-[1140px] px-4 md:px-5">
        <h2 className="text-center text-3xl font-bold text-[color:var(--ink)]">
          Explore Our Services
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[color:var(--ink-soft)]">
          Choose the easiest way to get your favourite Indian products to Australia.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="service-card group relative overflow-hidden rounded-2xl p-7 text-center text-white shadow-lg"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="service-card-shine pointer-events-none absolute inset-0" aria-hidden />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[color:var(--saffron)] ring-4 ring-[color:var(--saffron)]/80">
                {s.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">{s.body}</p>
              <Link href={s.href} className="sp-btn-orange mt-6 !px-4 !py-2 !text-sm !font-bold !text-white">
                {s.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
