"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";

/** Login/signup — authenticated customers go straight to dashboard */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, staff, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured) return;
    if (user) {
      router.replace(staff ? "/admin" : "/dashboard");
    }
  }, [user, staff, loading, configured, router]);

  if (!configured) return <>{children}</>;
  if (loading) return <AuthSplash />;
  if (user) return <AuthSplash message="Taking you to your dashboard…" />;
  return <>{children}</>;
}
