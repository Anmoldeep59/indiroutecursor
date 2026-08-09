import Image from "next/image";
import Link from "next/link";

const howSteps = [
  {
    n: "01",
    title: "SIGN-UP",
    body: "Sign up easily for a FREE Indian Virtual Address and permanent IND ID.",
  },
  {
    n: "02",
    title: "SHOP",
    body: "Shop from top Indian e-commerce stores & brands using your IndiRoute address.",
  },
  {
    n: "03",
    title: "SHIP",
    body: "Ship your consolidated parcel to your Australian address after AUD checkout.",
  },
  {
    n: "04",
    title: "RECEIVE",
    body: "Track delivery to your door. Destination duties in Australia are your responsibility.",
  },
];

const serviceCards = [
  {
    title: "Shop & Ship",
    body: "Register for a free virtual shipping address, store items for 20 free days, consolidate, and ship internationally.",
    href: "/signup",
    cta: "Get free address",
  },
  {
    title: "Assisted Purchase",
    body: "Facing problems while shopping from Indian sites? Our Personal Shopper will help you (launching after Beta).",
    href: "/assisted-purchase",
    cta: "Learn more",
  },
  {
    title: "Shipping Calculator",
    body: "Estimate India → Australia shipping. Final payable quotes always use warehouse weight & dimensions.",
    href: "/shipping-calculator",
    cta: "Check prices",
  },
];

const explore = [
  {
    title: "Assisted Purchase",
    body: "Payment hassles at checkout? Hire our team to shop for you when the service launches.",
    icon: "🛒",
  },
  {
    title: "Package Photos",
    body: "Every receive includes exterior and label photos in your locker dashboard.",
    icon: "📷",
  },
  {
    title: "Consolidate",
    body: "Combine multiple Indian parcels into one outbound box and pay once.",
    icon: "📦",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero — Shoppre navy + truck/illustration style */}
      <section className="relative overflow-hidden bg-[color:var(--navy)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(247,170,24,0.2), transparent 45%)",
            backgroundSize: "28px 28px, auto",
          }}
        />
        <div className="relative mx-auto grid max-w-[1140px] items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-5 md:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 px-3 py-1 text-xs text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              India package forwarding for Australia
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] md:text-[44px]">
              <span className="text-[color:var(--orange)]">
                International Shipping From India to Your
              </span>
              <br />
              <span className="text-white">Doorstep Worldwide</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 md:text-base">
              Shop from Amazon India, Flipkart, Myntra &amp; 500+ Indian stores. We deliver to
              your address abroad — consolidate parcels and save on shipping.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="sp-btn-orange text-[15px]">
                Sign Up Free – Get Virtual Address →
              </Link>
              <Link href="/how-it-works" className="sp-btn-outline-white text-[15px]">
                ▶ How it Works
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 text-white sm:grid-cols-4">
              {[
                ["3–6 days", "Typical transit*"],
                ["20 days", "Free storage"],
                ["AUD", "Stripe checkout"],
                ["No wallet", "Pay when shipping"],
              ].map(([a, b]) => (
                <div key={a}>
                  <p className="text-xl font-bold text-[color:var(--orange)]">{a}</p>
                  <p className="text-xs text-white/65">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#243868] to-[#121c38] p-8 shadow-2xl">
              <Image
                src="/brand/indiroute-logo.png"
                alt="IndiRoute"
                width={220}
                height={220}
                className="mx-auto object-contain drop-shadow-2xl"
                priority
              />
              <p className="mt-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--orange)]">
                Bringing India to You
              </p>
              <p className="mt-2 text-center text-sm text-white/70">
                Personal locker · Photos · Consolidate · Ship to AU
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping calculator strip */}
      <section className="bg-[#243868] py-10">
        <div className="mx-auto max-w-[720px] px-4 text-center text-white">
          <h2 className="text-3xl font-bold">Shipping Calculator</h2>
          <p className="mt-2 text-white/75">
            Want an estimate cost for your international shipping?
          </p>
          <Link href="/shipping-calculator" className="sp-btn-orange mt-6 inline-flex">
            Check Prices
          </Link>
        </div>
      </section>

      {/* How does it work */}
      <section className="bg-[color:var(--wash)] py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="text-center text-3xl font-bold text-[color:var(--navy)] md:text-[34px]">
            How does it work?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((s) => (
              <div
                key={s.n}
                className="rounded-xl bg-[#e8f1ff] px-5 py-6 text-center shadow-sm"
              >
                <p className="text-3xl font-extrabold text-[color:var(--navy)]">{s.n}</p>
                <p className="mt-2 text-sm font-extrabold tracking-wide text-[color:var(--navy)]">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services split */}
      <section className="py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="text-center text-3xl font-bold text-[color:var(--navy)]">Our Services</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div className="sp-card p-7">
              <h3 className="text-2xl font-bold text-[color:var(--navy)]">Shop &amp; Ship</h3>
              <p className="mt-2 text-sm font-semibold italic text-[color:var(--ink-soft)]">
                Shop from Indian Stores and Ship Internationally to your doorstep
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
                Register for a free virtual shipping address. We store packages for 20 free
                calendar days from Stored, consolidate when you&apos;re ready, then ship to
                Australia after Stripe payment. No wallet. No loyalty points.
              </p>
              <Link href="/signup" className="sp-btn-orange mt-6 inline-flex">
                Sign up free
              </Link>
            </div>
            <div className="grid gap-5">
              {serviceCards.slice(1).map((card) => (
                <div key={card.title} className="sp-card p-6">
                  <h3 className="text-xl font-bold text-[color:var(--navy)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                    {card.body}
                  </p>
                  <Link
                    href={card.href}
                    className="mt-3 inline-block text-sm font-semibold text-[color:var(--blue)] hover:underline"
                  >
                    {card.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Services gradient cards */}
      <section className="bg-[color:var(--wash)] py-14">
        <div className="mx-auto max-w-[1140px] px-4 md:px-5">
          <h2 className="text-center text-3xl font-bold text-[color:var(--navy)]">
            Explore Our Services
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {explore.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-7 text-center text-white shadow-lg"
                style={{
                  background: "linear-gradient(145deg, #6b21a8 0%, #db2777 100%)",
                }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[color:var(--orange)] text-2xl">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/90">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How shipping works SEO text */}
      <section className="py-14">
        <div className="mx-auto max-w-[900px] px-4 md:px-5">
          <h2 className="text-2xl font-bold text-[#b85c24] md:text-3xl">
            How International Shipping from India Works with IndiRoute
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
            <p>
              <strong className="text-[color:var(--navy)]">Step 1 :</strong> Shop any Indian
              store. Use your IndiRoute virtual address as your delivery address at checkout.
            </p>
            <p>
              <strong className="text-[color:var(--navy)]">Step 2 :</strong> We receive and store
              your orders. Every package goes into your personal locker with{" "}
              <strong>20 days of free storage</strong>.
            </p>
            <p>
              <strong className="text-[color:var(--navy)]">Step 3 :</strong> Consolidate and save.
              We combine orders into one box so you don&apos;t pay multiple times.
            </p>
            <p>
              <strong className="text-[color:var(--navy)]">Step 4 :</strong> Ship to Australia.
              Pay in AUD via Stripe, then track from dispatch to delivery.
            </p>
          </div>
          <h2 className="mt-12 text-2xl font-bold text-[#b85c24] md:text-3xl">
            Can&apos;t Pay on Indian Websites? Our Personal Shopper Will Buy It For You
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
            Assisted Purchase is planned after Beta stability. Share product links and we handle
            the buy — then your order arrives in your IndiRoute locker like any other package.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-y border-[color:var(--line)] bg-[color:var(--wash)] py-12">
        <div className="mx-auto flex max-w-[1140px] flex-col items-start justify-between gap-6 px-4 md:flex-row md:items-center md:px-5">
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--navy)] md:text-3xl">
              Delivering joy to your doorstep
            </h2>
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
              Sign-up and start shipping from India to Australia. Free to join.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="sp-btn-orange">
              Sign up for free
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-[4px] border border-[color:var(--navy)] px-5 py-3 text-[15px] font-semibold text-[color:var(--navy)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Orange final CTA */}
      <section className="bg-[color:var(--orange)] py-12">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            So what are you waiting for? Open your India address today.
          </h2>
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-[4px] bg-[color:var(--navy)] px-6 py-3 text-[15px] font-semibold text-white"
          >
            Sign up for free
          </Link>
        </div>
      </section>
    </div>
  );
}
