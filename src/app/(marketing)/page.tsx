import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, var(--hero-a) 0%, var(--hero-b) 48%, #245c48 72%, var(--hero-c) 160%)",
          }}
        />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.25), transparent 45%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--saffron)]">
            IndiRoute
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-white md:text-7xl">
            Shop in India. We deliver worldwide.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Get a personal India warehouse address, consolidate parcels, pay in AUD,
            and ship to Australia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-[color:var(--hero-a)]"
            >
              Get my India address
            </Link>
            <Link
              href="/shipping-calculator"
              className="rounded-md border border-white/40 px-5 py-3 text-sm font-medium text-white"
            >
              Estimate shipping
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">How it works</h2>
        <p className="mt-2 max-w-2xl text-[color:var(--ink-soft)]">
          Four steps from Indian checkout to Australian delivery.
        </p>
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Address", "Verify email and receive your permanent IND ID plus warehouse address."],
            ["Shop", "Order from Indian sites. Put your name and IND on the label."],
            ["We receive", "We photograph, weigh, and store packages for 20 free days."],
            ["We ship", "Get an AUD quote from warehouse measurements, pay via Stripe, track delivery."],
          ].map(([title, copy], i) => (
            <li key={title} className="border-t border-[color:var(--line)] pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--accent)]">
                Step {i + 1}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl">{title}</p>
              <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[color:var(--ink)] px-4 py-16 text-[color:var(--cream)] md:px-6">
        <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              Consolidate and save
            </h2>
            <p className="mt-3 text-[color:var(--cream-muted)]">
              Multiple Indian parcels can become one outbound shipment. Final price uses
              warehouse weight and dimensions — never your calculator estimate.
            </p>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              Built for trust
            </h2>
            <p className="mt-3 text-[color:var(--cream-muted)]">
              Real package photos, Stripe Checkout in AUD, clear storage rules, and no
              wallet balance. Destination duties in Australia remain your responsibility.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Beta corridor</h2>
        <p className="mt-2 text-[color:var(--ink-soft)]">
          Currently shipping to Australia only. Other countries are not available in Beta.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/pricing" className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-sm text-white">
            View pricing
          </Link>
          <Link href="/prohibited" className="rounded-md bg-[color:var(--wash)] px-4 py-2 text-sm">
            Prohibited items
          </Link>
          <Link href="/faq" className="rounded-md bg-[color:var(--wash)] px-4 py-2 text-sm">
            FAQ
          </Link>
        </div>
      </section>

      <section className="border-t border-[color:var(--line)] px-4 py-16 md:px-6">
        <div className="mx-auto max-w-6xl flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl">
              Ready for your India address?
            </h2>
            <p className="mt-2 text-[color:var(--ink-soft)]">
              Create an account, verify your email, and start shopping.
            </p>
          </div>
          <Link
            href="/signup"
            className="rounded-md bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white"
          >
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
