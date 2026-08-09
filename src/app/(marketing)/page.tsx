import Link from "next/link";
import { ExploreServices } from "@/components/brand/ExploreServices";
import { IndiaTruckArtHero } from "@/components/brand/IndiaTruckArtHero";

const howSteps = [
  {
    n: "01",
    title: "SIGN-UP",
    body: "Sign up easily for a FREE Indian warehouse address and permanent IND ID.",
  },
  {
    n: "02",
    title: "SHOP",
    body: "Shop from top Indian e-commerce stores & brands — Amazon IN, Flipkart, Myntra & more.",
  },
  {
    n: "03",
    title: "SHIP",
    body: "Ship your consolidated parcel to your Australian address with AUD Stripe checkout.",
  },
  {
    n: "04",
    title: "RECEIVE",
    body: "Get it at your door. Photos on every receive. 20 days free storage to consolidate.",
  },
];

const stats = [
  { value: "1M+", label: "Happy Customers" },
  { value: "5+", label: "Years Experience" },
  { value: "3M+", label: "Packages" },
  { value: "500+", label: "Indian Brands" },
  { value: "AU", label: "Beta Corridor" },
  { value: "60-80%", label: "Savings" },
];

const stores = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "Ajio",
  "Nykaa",
  "Tata Cliq",
  "Meesho",
  "Snapdeal",
];

export default function HomePage() {
  return (
    <div className="max-w-[100vw] overflow-x-clip bg-[color:var(--wash)]">
      {/* Hero — Shoppre-style navy + truck art */}
      <section className="relative overflow-x-clip bg-[color:var(--navy)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 50%, rgba(245,166,35,0.18), transparent 42%), radial-gradient(ellipse at 85% 30%, rgba(59,130,196,0.2), transparent 40%)",
          }}
        />
        {/* Dashed route motif */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
          aria-hidden
        >
          <path
            d="M-20 180 C 200 80, 400 280, 700 120 S 1100 300, 1400 160"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeDasharray="6 10"
            className="route-dash"
          />
        </svg>

        <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-10 md:px-5 md:py-16">
          <div className="hero-copy">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-xs text-white">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
              Trusted India → Australia parcel forwarding
            </div>

            <h1 className="ir-headline mt-6 text-[1.9rem] font-extrabold leading-[1.12] text-white sm:text-4xl md:text-[44px]">
              <span className="text-[color:var(--saffron)]">International Shipping</span>
              <br />
              From India to Your Doorstep Worldwide
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base">
              Shop from Amazon India, Flipkart, Myntra &amp; 500+ Indian stores. We deliver
              to your address abroad — save up to{" "}
              <span className="font-semibold text-[color:var(--saffron)]">80% on shipping</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="sp-btn-orange !rounded-md !px-6 !py-3.5 !text-[15px] !font-bold !text-white">
                Sign Up Free – Get Virtual Address →
              </Link>
              <Link href="/how-it-works" className="sp-btn-outline-white !rounded-md !px-5 !py-3 !text-[15px]">
                ▶ How it Works
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/15 pt-6 text-white sm:grid-cols-4">
              {[
                ["3–6 days", "Delivery time"],
                ["80%", "Shipping savings"],
                ["500+", "Indian stores"],
                ["20 days", "Free storage"],
              ].map(([a, b]) => (
                <div key={a} className="stat-pop">
                  <p className="text-lg font-extrabold sm:text-xl">{a}</p>
                  <p className="mt-0.5 text-xs text-white/65">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <IndiaTruckArtHero />
        </div>
      </section>

      {/* Promo strip */}
      <section className="bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#7c3aed] px-4 py-3.5 text-center text-white md:px-5">
        <p className="text-sm font-medium sm:text-base">
          Make your 1st best purchase with a{" "}
          <span className="font-extrabold text-[#fde047]">FLAT welcome offer</span>
          {" — "}
          <Link href="/signup" className="ml-1 inline-flex rounded-full border border-white/40 bg-[color:var(--saffron)] px-3 py-1 text-xs font-bold text-white">
            Sign up free
          </Link>
        </p>
      </section>

      {/* Stats grid */}
      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:gap-4 md:px-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg bg-[#e8f1fb] px-4 py-6 text-center"
            >
              <p className="text-2xl font-extrabold text-[color:var(--ink)] md:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-[color:var(--ink-soft)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Favourite stores */}
      <section className="bg-white pb-12 pt-4">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="text-center text-xl font-semibold text-[color:var(--ink-soft)] md:text-2xl">
            Take a walk around your favourite stores
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            {stores.map((name) => (
              <span
                key={name}
                className="text-sm font-bold tracking-wide text-[color:var(--ink)]/70 md:text-base"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ExploreServices />

      {/* Shipping calculator banner */}
      <section className="bg-[color:var(--wash)] py-12">
        <div className="mx-auto max-w-[900px] px-4 md:px-5">
          <div className="rounded-2xl bg-[color:var(--navy)] px-6 py-12 text-center text-white shadow-lg md:px-10">
            <h2 className="text-3xl font-bold text-white">Shipping Calculator</h2>
            <p className="mt-2 text-white/85">
              Want an estimate cost for your international shipping?
            </p>
            <Link href="/shipping-calculator" className="sp-btn-orange mt-7 inline-flex !rounded-md !px-8 !py-3.5 !font-bold !text-white">
              Check Prices
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="text-center text-3xl font-bold text-[color:var(--ink)]">
            How does it work?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((s) => (
              <div
                key={s.n}
                className="step-rise rounded-xl bg-[#e8f1fb] px-5 py-6 text-left"
              >
                <p className="text-3xl font-extrabold text-[color:var(--ink)]/40">{s.n}</p>
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

      {/* Our Services split */}
      <section className="bg-[color:var(--wash)] py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="mb-8 text-center text-3xl font-bold text-[color:var(--ink)]">
            Our Services
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Shop &amp; Ship</h3>
              <p className="mt-2 text-sm font-semibold italic text-[color:var(--ink-soft)]">
                Shop from Indian Stores and Ship Internationally to your doorstep
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                Get a personal India warehouse address with your IND ID. We receive,
                photograph, store (20 free days), consolidate, and ship to Australia.
              </p>
              <Link href="/signup" className="sp-btn-orange mt-6 inline-flex !text-white">
                Get My India Address
              </Link>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-[color:var(--ink)]">Assisted Purchase</h3>
              <p className="mt-2 text-sm font-semibold italic text-[color:var(--ink-soft)]">
                Facing problems while shopping from Indian sites? Our Personal Shopper will help you.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                Share product links and we&apos;ll shop for you once Assisted Purchase launches
                (post-Beta). International shipping remains a separate payment.
              </p>
              <Link
                href="/assisted-purchase"
                className="mt-6 inline-block text-sm font-semibold text-[color:var(--chakra)] hover:underline"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[color:var(--navy)] py-12 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">
          Ready for your India address?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
          Free signup. Verify email. Start shopping from India today.
        </p>
        <Link href="/signup" className="sp-btn-orange mt-6 inline-flex !text-white">
          Sign Up Free – Get Virtual Address →
        </Link>
      </section>
    </div>
  );
}
