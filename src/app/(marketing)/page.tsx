import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Shop any Indian store",
    body: "Use your IndiRoute virtual address at checkout on Flipkart, Myntra, Amazon India, Ajio, Nykaa, or local sellers.",
  },
  {
    n: "2",
    title: "We receive & store",
    body: "Packages arrive at our India warehouse and go into your personal locker. Enjoy 20 days of free storage.",
  },
  {
    n: "3",
    title: "Consolidate & save",
    body: "Combine multiple orders into one box instead of shipping separately — the smart way to cut international shipping cost.",
  },
  {
    n: "4",
    title: "Ship to Australia",
    body: "Choose a courier option, pay in AUD via Stripe, and track your parcel to your doorstep.",
  },
];

const benefits = [
  {
    title: "Free Indian address",
    body: "Get a permanent IND ID and warehouse address after email verification. Start shopping the same day.",
  },
  {
    title: "20 days free storage",
    body: "Shop from multiple stores at your pace. Storage clock starts when a package becomes Stored.",
  },
  {
    title: "Package photos",
    body: "See real receive photos in your dashboard before you pay to ship — transparency first.",
  },
  {
    title: "AUD checkout",
    body: "No wallet. Pay shipping + handling + storage due directly with Stripe when you’re ready.",
  },
];

const faqs = [
  {
    q: "How can I buy from Flipkart or Myntra if I live in Australia?",
    a: "Most Indian sites don’t ship internationally. Sign up with IndiRoute, use your India warehouse address at checkout, then we forward your parcels to Australia.",
  },
  {
    q: "What is a virtual Indian shipping address?",
    a: "It’s a real warehouse address assigned to you with your IND-XXXXXX. Merchants deliver there; we notify you, store the package, and ship when you pay.",
  },
  {
    q: "Is the shipping calculator the final price?",
    a: "No. The public calculator is an estimate only. Payable quotes use warehouse-recorded weight and dimensions and expire in 48 hours.",
  },
  {
    q: "Who pays Australian duties and taxes?",
    a: "You do. IndiRoute does not collect destination duties at checkout in Beta.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero — ShopPre style navy + orange */}
      <section className="relative overflow-hidden bg-[color:var(--navy)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(247,170,24,0.35), transparent 40%), linear-gradient(120deg, #1b284d 0%, #243868 55%, #1b284d 100%)",
          }}
        />
        <div className="sp-container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--orange)]">
              India&apos;s package forwarding — for Australia
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              Shop from India and Ship Internationally
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              Sign up free, get your Indian virtual shipping address, consolidate parcels,
              and deliver to your door in Australia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="sp-btn-orange">
                Sign up for free
              </Link>
              <Link href="/dashboard" className="sp-btn-outline-white">
                Dashboard
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/55">
              Beta corridor: India → Australia · No wallet · Pay only when shipping
            </p>
          </div>
          <div className="sp-card relative overflow-hidden p-6 md:p-8">
            <p className="text-sm font-semibold text-[color:var(--orange)]">
              Delivering joy to your doorstep
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[color:var(--navy)]">
              Your personal India locker
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-[color:var(--ink-soft)]">
              <li className="flex gap-2">
                <span className="text-[color:var(--orange)] font-bold">✓</span>
                Free signup & permanent IND ID
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--orange)] font-bold">✓</span>
                20 days free storage from Stored
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--orange)] font-bold">✓</span>
                Consolidate multiple Indian parcels
              </li>
              <li className="flex gap-2">
                <span className="text-[color:var(--orange)] font-bold">✓</span>
                Stripe AUD payment + tracking
              </li>
            </ul>
            <Link href="/shipping-calculator" className="sp-btn-orange mt-6 w-full">
              Check shipping rates
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--wash)]">
        <div className="sp-container grid gap-4 py-6 text-center text-sm font-medium text-[color:var(--navy)] sm:grid-cols-3">
          <p>Secure Stripe payments</p>
          <p>Package photos in your account</p>
          <p>Clear storage & shipping policies</p>
        </div>
      </section>

      {/* Main SEO block */}
      <section className="sp-container py-14">
        <h2 className="text-3xl font-bold text-[color:var(--navy)] md:text-[32px]">
          Shop from India and Ship Internationally — Delivered to Australia
        </h2>
        <p className="mt-4 max-w-4xl text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
          Want to buy from Indian online stores but can&apos;t because they don&apos;t ship
          internationally? IndiRoute is a package forwarding service that lets you shop from
          Indian stores and get orders shipped to Australia. Sign up, get your free Indian
          virtual shipping address, and start shopping.
        </p>
      </section>

      {/* How it works — 4 steps */}
      <section className="bg-[color:var(--wash)] py-14">
        <div className="sp-container">
          <h2 className="text-center text-3xl font-bold text-[color:var(--navy)]">
            How international shipping from India works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[color:var(--ink-soft)]">
            Four simple steps from Indian checkout to your Australian address.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.n} className="sp-card p-5">
                <span className="sp-step-num">{step.n}</span>
                <h3 className="mt-4 text-lg font-bold text-[color:var(--navy)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/how-it-works" className="font-semibold text-[color:var(--blue)] hover:underline">
              See full how it works →
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="sp-container py-14">
        <h2 className="text-3xl font-bold text-[color:var(--navy)]">Why IndiRoute</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-[8px] bg-[color:var(--blue-soft)] p-5">
              <h3 className="text-lg font-bold text-[color:var(--navy)]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consolidation callout */}
      <section className="bg-[color:var(--navy)] py-14 text-white">
        <div className="sp-container grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Consolidate and save</h2>
            <p className="mt-4 text-white/75 leading-relaxed">
              Instead of shipping five packages separately, combine them into one box. Final
              payable quotes always use warehouse weight and dimensions — never calculator
              estimates alone.
            </p>
          </div>
          <div className="rounded-[8px] bg-white/10 p-6">
            <p className="text-[color:var(--orange)] font-semibold">Beta focus</p>
            <p className="mt-2 text-2xl font-bold">India → Australia</p>
            <p className="mt-3 text-sm text-white/70">
              Assisted Purchase is coming later (P1). Public tracking page is P1. Logged-in
              tracking is available now after dispatch.
            </p>
            <Link href="/signup" className="sp-btn-orange mt-6 inline-flex">
              Open your locker free
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band like ShopPre */}
      <section className="border-y border-[color:var(--line)] bg-[color:var(--wash)] py-12">
        <div className="sp-container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--navy)] md:text-3xl">
              Delivering joy to your doorstep
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              Sign up and start shipping from India to Australia. Free to join.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="sp-btn-orange">
              Sign up for free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[4px] border border-[color:var(--navy)] px-5 py-3 text-[15px] font-semibold text-[color:var(--navy)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ accordion-style */}
      <section className="sp-container py-14">
        <h2 className="text-3xl font-bold text-[color:var(--navy)]">
          Discover more answers on IndiRoute
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="sp-card group p-5">
              <summary className="cursor-pointer list-none text-[15px] font-semibold text-[color:var(--navy)]">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="text-[color:var(--orange)] group-open:rotate-45 transition">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--ink-soft)]">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/faq" className="font-semibold text-[color:var(--blue)] hover:underline">
            View all FAQs →
          </Link>
        </div>
      </section>

      {/* Final orange CTA */}
      <section className="bg-[color:var(--orange)] py-12">
        <div className="sp-container text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            So what are you waiting for? Open your India address today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
            Membership is free. Verify your email and receive your IND ID immediately.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-[4px] bg-[color:var(--navy)] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[color:var(--navy-deep)]"
          >
            Sign up for free
          </Link>
        </div>
      </section>
    </div>
  );
}
