import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--ivory)] px-4 text-center">
      <BrandLogo href="/" variant="dark" size="lg" />
      <h1 className="mt-8 text-3xl font-bold text-[color:var(--ink)]">Page not found</h1>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        That page doesn&apos;t exist on IndiRoute.
      </p>
      <Link href="/" className="sp-btn-orange mt-6">
        Go home
      </Link>
    </div>
  );
}
