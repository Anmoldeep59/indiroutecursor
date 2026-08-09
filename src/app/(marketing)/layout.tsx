"use client";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthSplash } from "@/components/auth/AuthSplash";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, staff, loading, configured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  // Authenticated customers on / → dashboard (gate before visitor chrome)
  useEffect(() => {
    if (!configured || loading) return;
    if (isHome && user) {
      router.replace(staff ? "/admin" : "/dashboard");
    }
  }, [configured, loading, isHome, user, staff, router]);

  if (configured && loading && isHome) {
    return <AuthSplash />;
  }
  if (configured && user && isHome) {
    return <AuthSplash message="Opening your IndiRoute dashboard…" />;
  }

  return (
    <div className="flex min-h-full max-w-[100vw] flex-col overflow-x-clip bg-[color:var(--wash)] text-[color:var(--ink)]">
      <SiteHeader />
      <main className="min-w-0 flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
