import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Assisted Purchase" };

export default function AssistedPurchasePage() {
  return (
    <div className="bg-[color:var(--wash)]">
      <section className="bg-[color:var(--navy)] py-14 text-white">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--orange)]">
            Personal Shopper
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Buy Anything From India</h1>
          <p className="mx-auto mt-2 max-w-lg text-2xl font-bold text-white/90">We Shop For You</p>
          <p className="mx-auto mt-5 max-w-2xl text-white/75">
            Send us product links from Amazon, Flipkart, Myntra or any Indian store. We buy &amp;
            ship to Australia.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/30 px-4 py-2 text-sm">
              Coming in P1 — not required for Beta launch
            </span>
            <Link href="/signup" className="sp-btn-orange">
              Get India address first
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[900px] px-4 py-14">
        <div className="sp-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[color:var(--navy)]">
            Can&apos;t pay on Indian websites?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
            Many Indian sites block international cards or need local OTP. IndiRoute Assisted
            Purchase lets you share a product URL, variant, size and notes. We confirm price +
            service fee, you pay via Stripe, then we buy and receive into your locker.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--ink-soft)]">
            Target fee when launched: 10% service fee with ₹299 minimum (subject to margin
            validation). International shipping remains a separate payment after warehouse receive.
          </p>
          <p className="mt-4 text-sm font-semibold text-[color:var(--orange)]">
            No wallet. No loyalty points. Direct Stripe payment only.
          </p>
        </div>
      </section>
    </div>
  );
}
