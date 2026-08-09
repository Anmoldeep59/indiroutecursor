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
    <div className="flex min-h-full flex-col bg-[color:var(--ivory)] text-[color:var(--ink)]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
