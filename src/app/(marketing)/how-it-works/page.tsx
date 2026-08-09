import type { Metadata } from "next";
import Link from "next/link";
import { IndiaMapRoute } from "@/components/brand/IndiaMapRoute";
import { TrustBadges } from "@/components/brand/TrustBadges";
import { TricolorBar } from "@/components/brand/TricolorBar";

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
    <div className="bg-[color:var(--ivory)]">
      <TricolorBar />
      <section className="relative overflow-hidden bg-[color:var(--navy)] py-14 text-white">
        <svg
          aria-hidden
          viewBox="0 0 200 260"
          className="pointer-events-none absolute -right-10 top-0 h-full w-auto opacity-10"
        >
          <path
            d="M100 12c22 8 40 28 48 50 10 24 28 36 30 58 2 20-8 38-6 56 2 20 18 34 16 54-2 18-20 28-24 46-4 16 4 34-8 46-14 14-36 8-52 18-14 8-22 26-40 28-18 2-34-14-52-14-16 0-34 12-48 4-16-8-20-28-24-46-4-20 4-38-4-56-8-18-26-22-30-42-4-22 10-40 16-58 8-18 4-38 18-50C48 20 72 28 90 22c12-4 28-4 40-10z"
            fill="#fffcf8"
          />
        </svg>
        <div className="sp-container relative">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--orange)]">
            How IndiRoute works
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight">
            Shop India through real trade hubs — then ship smarter to Australia
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Package consolidation combines multiple parcels into one — saving members on
            international shipping charges from Indian ports and air-cargo gateways.
          </p>
          <div className="mt-6">
            <TrustBadges variant="dark" dense />
          </div>
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

        <div className="mt-14">
          <h2 className="text-2xl font-bold text-[color:var(--ink)]">India-centred network</h2>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-soft)]">
            See how India sits at the hub of your shopping route. Live Beta corridor highlighted
            to Australia.
          </p>
          <IndiaMapRoute className="mt-6 w-full" showGlobalHints />
        </div>

        <div className="mt-12 rounded-[8px] bg-[color:var(--orange)] p-6 text-center text-white sm:p-8">
          <h2 className="ir-headline mx-auto max-w-3xl text-xl font-bold sm:text-2xl">
            So what are you waiting for? Open your India address today.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white">
            All you need is a free account to get your Indian shipping address.
          </p>
          <Link href="/signup" className="sp-btn-navy mt-6 !text-sm">
            Sign up for free
          </Link>
        </div>
      </section>
    </div>
  );
}
