import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[color:var(--navy)] text-white">
      <div className="mx-auto grid max-w-[1140px] gap-10 px-4 py-14 md:grid-cols-4 md:px-5">
        <div className="md:col-span-1">
          <BrandLogo href="/" />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Shop Indian stores and ship internationally. Personal India warehouse address,
            consolidation, and Australia delivery for Beta.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--orange)]">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><Link href="/how-it-works" className="hover:text-[color:var(--orange)]">How it works</Link></li>
            <li><Link href="/shipping-calculator" className="hover:text-[color:var(--orange)]">Shipping Rates</Link></li>
            <li><Link href="/assisted-purchase" className="hover:text-[color:var(--orange)]">Assisted Purchase</Link></li>
            <li><Link href="/pricing" className="hover:text-[color:var(--orange)]">Pricing</Link></li>
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
        <div className="mx-auto flex max-w-[1140px] flex-col gap-2 px-4 py-4 text-center text-xs text-white/55 md:flex-row md:justify-between md:px-5">
          <p>© {new Date().getFullYear()} IndiRoute · indiroute.co</p>
          <p>Beta: India → Australia · No wallet · No loyalty points</p>
        </div>
      </div>
    </footer>
  );
}
