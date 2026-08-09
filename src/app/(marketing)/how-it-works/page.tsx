import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  {
    title: "Join",
    body: "Sign up for free and receive your personal locker with a virtual Indian shipping address (IND-XXXXXX) after email verification.",
  },
  {
    title: "Explore",
    body: "Browse Indian online stores — Flipkart, Myntra, Amazon India, Ajio, Nykaa, and more — or shop any local seller that delivers in India.",
  },
  {
    title: "Use your IndiRoute address",
    body: "At checkout, use your IndiRoute warehouse address and include your IND ID on the label. Tip: estimate cost with our shipping calculator.",
  },
  {
    title: "Get notified",
    body: "We photograph, weigh, and measure your parcel, then notify you. Manage packages 24/7 from your dashboard. Request consolidation when ready.",
  },
  {
    title: "Ship & enjoy",
    body: "Get an AUD quote from warehouse measurements, pay with Stripe, and track delivery to Australia. 20 days free storage helps you consolidate.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      <section className="bg-[color:var(--navy)] py-14 text-white">
        <div className="sp-container">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--orange)]">
            How IndiRoute works
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight">
            Experts at helping you shop India and ship smarter
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Package consolidation combines multiple parcels into one — saving members on
            international shipping charges.
          </p>
        </div>
      </section>

      <section className="sp-container py-14">
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li key={step.title} className="sp-card grid gap-4 p-6 md:grid-cols-[80px_1fr]">
              <div className="flex md:justify-center">
                <span className="sp-step-num !h-12 !w-12 !text-lg">{i + 1}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide text-[color:var(--navy)]">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-[8px] bg-[color:var(--orange)] p-8 text-center text-white">
          <h2 className="text-2xl font-bold">
            So what are you waiting for? Open your big box of happiness today.
          </h2>
          <p className="mt-2 text-sm text-white/90">
            All you need is a free account to get your Indian shipping address.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-[4px] bg-[color:var(--navy)] px-6 py-3 text-sm font-semibold text-white"
          >
            Sign up for free
          </Link>
        </div>
      </section>
    </div>
  );
}
