import Link from "next/link";
import { HeroFreightVisual } from "@/components/brand/HeroFreightVisual";
import { IndiaCraftStrip } from "@/components/brand/IndiaCraftStrip";
import { IndiaMapRoute } from "@/components/brand/IndiaMapRoute";
import { TricolorBar } from "@/components/brand/TricolorBar";
import { TrustBadges } from "@/components/brand/TrustBadges";

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

const hubs = [
  { code: "JNPT", name: "Mumbai Port", role: "Ocean gateway" },
  { code: "DEL", name: "Delhi Air Cargo", role: "North India airlift" },
  { code: "BOM", name: "Mumbai Air Cargo", role: "West coast freight" },
  { code: "MAA", name: "Chennai Air Cargo", role: "South India corridor" },
];

export default function HomePage() {
  return (
      <div className="max-w-[100vw] overflow-x-clip bg-[color:var(--ivory)]">
      <TricolorBar />

      {/* Hero — India freight identity */}
      <section className="relative overflow-x-clip bg-[color:var(--navy)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 40%, rgba(255,103,31,0.4), transparent 32%), radial-gradient(circle at 88% 18%, rgba(4,106,56,0.28), transparent 38%), radial-gradient(circle at 50% 100%, rgba(27,79,156,0.35), transparent 45%)",
          }}
        />
        {/* Soft India silhouette in hero background */}
        <svg
          aria-hidden
          viewBox="0 0 200 260"
          className="pointer-events-none absolute -left-16 bottom-0 h-[85%] w-auto opacity-[0.07]"
        >
          <path
            d="M100 12c22 8 40 28 48 50 10 24 28 36 30 58 2 20-8 38-6 56 2 20 18 34 16 54-2 18-20 28-24 46-4 16 4 34-8 46-14 14-36 8-52 18-14 8-22 26-40 28-18 2-34-14-52-14-16 0-34 12-48 4-16-8-20-28-24-46-4-20 4-38-4-56-8-18-26-22-30-42-4-22 10-40 16-58 8-18 4-38 18-50C48 20 72 28 90 22c12-4 28-4 40-10z"
            fill="#fffcf8"
          />
        </svg>

        <div className="relative mx-auto grid max-w-[1140px] items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-5 md:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs text-white">
              <span aria-hidden>🇮🇳</span>
              <span className="text-white/50">→</span>
              <span aria-hidden>🇦🇺</span>
              <span>Beta corridor: India → Australia</span>
            </div>
              <h1 className="ir-headline mt-5 text-[1.85rem] font-extrabold leading-[1.15] text-white sm:text-4xl md:text-[46px]">
                Shop in India.
                <br />
                <span className="text-[color:var(--saffron)]">We deliver to Australia.</span>
              </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/80">
              Get your IndiRoute India address, shop from Indian stores, consolidate your
              parcels, and have them delivered to Australia — routed through Indian trade
              hubs with premium parcel care.
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
          <HeroFreightVisual />
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-[color:var(--line)] bg-[color:var(--surface)] py-5">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <TrustBadges />
        </div>
      </section>

      {/* Indian ports & hubs */}
      <section className="py-12">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
                Indian ports & hubs
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[color:var(--ink)] md:text-3xl">
                Connected to India&apos;s trade gateways
              </h2>
            </div>
            <p className="max-w-md text-sm text-[color:var(--ink-soft)]">
              Your parcels move through India-first infrastructure — ports and air-cargo
              hubs that power real export lanes.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((h) => (
              <div
                key={h.code}
                className="relative overflow-hidden rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-sm"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[color:var(--saffron)] via-white to-[color:var(--india-green)]" />
                <p className="text-xs font-bold tracking-widest text-[color:var(--chakra)]">
                  {h.code}
                </p>
                <p className="mt-1 text-lg font-bold text-[color:var(--ink)]">{h.name}</p>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{h.role}</p>
              </div>
            ))}
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

      {/* Global network map */}
      <section className="py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--saffron)]">
              Services · Global network
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--ink)]">
              India at the centre of your shopping route
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              Live Beta focuses on Australia. Future corridors (UAE, UK, USA and more) stay
              visible as the network grows — without diluting the India hub story.
            </p>
          </div>
          <IndiaMapRoute className="h-auto w-full max-w-full shadow-[var(--shadow-card)]" />
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

      <IndiaCraftStrip />

      <section className="bg-[color:var(--wash)] py-14">
        <div className="mx-auto grid max-w-[1140px] gap-8 px-4 md:grid-cols-2 md:px-5">
          <div className="sp-card relative overflow-hidden p-7">
            <div className="absolute right-0 top-0 h-20 w-20 opacity-10">
              <svg viewBox="0 0 80 80" aria-hidden>
                <rect x="16" y="28" width="48" height="28" rx="3" fill="#0f2744" />
                <path d="M10 36h60l-8-12H18z" fill="#ff671f" />
              </svg>
            </div>
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

        <section className="relative bg-[color:var(--saffron)] py-12 text-white">
        <div className="absolute inset-x-0 bottom-0">
          <TricolorBar />
        </div>
        <div className="relative mx-auto w-full max-w-[900px] px-4 pb-3 text-center sm:px-6">
          <h2 className="ir-band-title">
            <span>🇮🇳 Shop India</span>
            <span className="opacity-80" aria-hidden>
              ·
            </span>
            <span>Consolidate</span>
            <span className="opacity-80" aria-hidden>
              ·
            </span>
            <span>Deliver 🇦🇺</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white">
            Flag-branded care from Indian hubs to Australian doors.
          </p>
          <Link href="/signup" className="sp-btn-navy mt-6 !text-[15px]">
            Sign up free
          </Link>
        </div>
      </section>
    </div>
  );
}
