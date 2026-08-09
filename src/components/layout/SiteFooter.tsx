import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--line)] bg-[color:var(--ink)] text-[color:var(--cream)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-[family-name:var(--font-display)] text-3xl">IndiRoute</p>
          <p className="mt-3 max-w-md text-sm text-[color:var(--cream-muted)]">
            Shop in India. We deliver worldwide. Personal India warehouse address,
            consolidation, and Australia-bound shipping for Beta.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/how-it-works">How it works</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/prohibited">Prohibited items</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/shipping-policy">Shipping policy</Link></li>
            <li><Link href="/refund-policy">Refund policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[color:var(--cream-muted)]">
        © {new Date().getFullYear()} IndiRoute · indiroute.co · Beta: India → Australia
      </div>
    </footer>
  );
}
