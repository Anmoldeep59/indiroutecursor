import Link from "next/link";
import Image from "next/image";

const howSteps = [
  {
    n: "01",
    title: "SIGN-UP",
    body: "Create your free IndiRoute account and verify your email to unlock your IND ID.",
  },
  {
    n: "02",
    title: "SHOP",
    body: "Shop Amazon India, Flipkart, Myntra & more — deliver to your India warehouse address.",
  },
  {
    n: "03",
    title: "CONSOLIDATE",
    body: "We store packages 20 free days. Combine multiple parcels into one outbound box.",
  },
  {
    n: "04",
    title: "SHIP TO AU",
    body: "Pay in AUD via Stripe, we dispatch manually, and you track to Australia.",
  },
];

export default function HomePage() {
  return (
      <div className="bg-[color:var(--ivory)]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[color:var(--navy)]">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 40%, rgba(255,103,31,0.35), transparent 35%), radial-gradient(circle at 85% 20%, rgba(4,106,56,0.25), transparent 40%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1140px] items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-5 md:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs text-white">
                <span aria-hidden>🇮🇳</span>
                <span className="text-white/50">→</span>
                <span aria-hidden>🇦🇺</span>
                <span>Beta corridor: India → Australia</span>
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] text-white md:text-[46px]">
                Shop in India.
                <br />
                <span className="text-[color:var(--saffron)]">We deliver to Australia.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/80">
                Get your IndiRoute India address, shop from Indian stores, consolidate your
                parcels, and have them delivered to Australia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="sp-btn-orange">
                  Get My India Address
                </Link>
                <Link href="/shipping-calculator" className="sp-btn-outline-white">
                  Calculate Shipping
                </Link>
              </div>
              <div className="mt-8 india-route-line max-w-md" />
              <div className="mt-6 grid grid-cols-2 gap-4 text-white sm:grid-cols-4">
                {[
                  ["20 days", "Free storage"],
                  ["AUD", "Stripe checkout"],
                  ["Photos", "On every receive"],
                  ["No wallet", "Pay when shipping"],
                ].map(([a, b]) => (
                  <div key={a}>
                    <p className="text-lg font-bold text-[color:var(--saffron)]">{a}</p>
                    <p className="text-xs text-white/65">{b}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a3a5c] to-[#0a1b30] p-8 shadow-2xl">
                <Image
                  src="/brand/logo-on-dark.png"
                  alt="IndiRoute"
                  width={200}
                  height={133}
                  className="mx-auto bg-transparent object-contain"
                  style={{ backgroundColor: "transparent" }}
                  priority
                />
                <p className="mt-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
                  Bringing India to You
                </p>
                <div className="mt-6 flex items-center justify-center gap-3 text-sm text-white">
                  <span className="rounded-full bg-[color:var(--saffron)] px-3 py-1 font-bold text-white">
                    🇮🇳 India
                  </span>
                  <span className="text-[color:var(--saffron)]">······✈······</span>
                  <span className="rounded-full bg-[color:var(--india-green)] px-3 py-1 font-bold text-white">
                    🇦🇺 Australia
                  </span>
                </div>
                <p className="mt-4 text-center text-xs text-white/60">
                  Personal locker · Package photos · Consolidate · Track
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--chakra)] py-10">
          <div className="mx-auto max-w-[720px] px-4 text-center text-white">
            <h2 className="text-3xl font-bold">Shipping Calculator</h2>
            <p className="mt-2 text-white/80">
              Estimate India → Australia shipping. Final quotes use warehouse measurements.
            </p>
            <Link href="/shipping-calculator" className="sp-btn-orange mt-6 inline-flex">
              Check Prices
            </Link>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-[1140px] px-4 md:px-5">
            <h2 className="text-center text-3xl font-bold text-[color:var(--ink)]">
              How does it work?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[color:var(--ink-soft)]">
              From Indian checkout to your Australian doorstep.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {howSteps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-6 text-center shadow-sm"
                >
                  <p className="text-3xl font-extrabold text-[color:var(--saffron)]">{s.n}</p>
                  <p className="mt-2 text-sm font-extrabold tracking-wide text-[color:var(--ink)]">
                    {s.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--wash)] py-14">
          <div className="mx-auto grid max-w-[1140px] gap-8 px-4 md:grid-cols-2 md:px-5">
            <div className="sp-card p-7">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Shop &amp; Ship</h3>
              <p className="mt-2 text-sm font-semibold italic text-[color:var(--ink-soft)]">
                Your personal India warehouse for overseas shopping
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                Use your IND ID at checkout on Indian sites. We receive, photograph, store,
                consolidate, and ship to Australia. No wallet. No loyalty points.
              </p>
              <Link href="/signup" className="sp-btn-orange mt-6 inline-flex">
                Get My India Address
              </Link>
            </div>
            <div className="sp-card p-7">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Assisted Purchase</h3>
              <p className="mt-2 text-sm font-semibold italic text-[color:var(--ink-soft)]">
                Coming after Beta (P1)
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                Can&apos;t pay on Indian websites? Share product links and we&apos;ll shop for you
                once Assisted Purchase launches.
              </p>
              <Link
                href="/assisted-purchase"
                className="mt-6 inline-block text-sm font-semibold text-[color:var(--chakra)] hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)] py-12">
          <div className="mx-auto flex max-w-[1140px] flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center md:px-5">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--ink)] md:text-3xl">
                Ready for your India address?
              </h2>
              <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                Free signup. Verify email. Start shopping from India today.
              </p>
            </div>
            <Link href="/signup" className="sp-btn-orange">
              Get My India Address
            </Link>
          </div>
        </section>

        <section className="bg-[color:var(--saffron)] py-12">
          <div className="mx-auto max-w-[900px] px-4 text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              🇮🇳 Shop India · Consolidate · Deliver 🇦🇺
            </h2>
            <Link
              href="/signup"
              className="mt-6 inline-flex rounded-[4px] bg-[color:var(--navy)] px-6 py-3 text-[15px] font-semibold text-white"
            >
              Sign up free
            </Link>
          </div>
        </section>
      </div>
  );
}
