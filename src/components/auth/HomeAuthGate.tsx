"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";

/** Authenticated visits to / redirect to dashboard — no visitor flash */
export function HomeAuthGate({ children }: { children: React.ReactNode }) {
  const { user, staff, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured) return;
    if (user) {
      router.replace(staff ? "/admin" : "/dashboard");
    }
  }, [user, staff, loading, configured, router]);

  if (configured && loading) {
    return <AuthSplash />;
  }
  if (configured && user) {
    return <AuthSplash message="Opening your IndiRoute dashboard…" />;
  }
  return <>{children}</>;
}
