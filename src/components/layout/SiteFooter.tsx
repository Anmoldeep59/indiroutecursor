import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[color:var(--navy)] text-white">
      <div className="sp-container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-2xl font-bold">
            Indi<span className="text-[color:var(--orange)]">Route</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Shop Indian stores and ship internationally. Personal India warehouse address,
            consolidation, and Australia delivery for Beta.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--orange)]">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/how-it-works" className="hover:text-[color:var(--orange)]">How it works</Link></li>
            <li><Link href="/shipping-calculator" className="hover:text-[color:var(--orange)]">Shipping calculator</Link></li>
            <li><Link href="/pricing" className="hover:text-[color:var(--orange)]">Pricing</Link></li>
            <li><Link href="/countries" className="hover:text-[color:var(--orange)]">Countries</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--orange)]">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/faq" className="hover:text-[color:var(--orange)]">FAQ</Link></li>
            <li><Link href="/prohibited" className="hover:text-[color:var(--orange)]">Prohibited items</Link></li>
            <li><Link href="/contact" className="hover:text-[color:var(--orange)]">Contact</Link></li>
            <li><Link href="/about" className="hover:text-[color:var(--orange)]">About us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--orange)]">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/terms" className="hover:text-[color:var(--orange)]">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-[color:var(--orange)]">Privacy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-[color:var(--orange)]">Shipping policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-[color:var(--orange)]">Refund policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="sp-container flex flex-col gap-2 py-4 text-center text-xs text-white/55 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} IndiRoute · indiroute.co</p>
          <p>Beta corridor: India → Australia</p>
        </div>
      </div>
    </footer>
  );
}
