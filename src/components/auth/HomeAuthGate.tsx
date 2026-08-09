"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";

/** Authenticated visits to / redirect appropriately — no visitor flash */
export function HomeAuthGate({ children }: { children: React.ReactNode }) {
  const { user, staff, loading, configured, needsOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) return;
    if (staff) {
      router.replace("/admin");
      return;
    }
    if (needsOtp) {
      router.replace("/verify-otp");
      return;
    }
    router.replace("/dashboard");
  }, [user, staff, needsOtp, loading, configured, router]);

  if (configured && loading) {
    return <AuthSplash />;
  }
  if (configured && user) {
    return (
      <AuthSplash
        message={
          needsOtp
            ? "Opening email verification…"
            : "Opening your IndiRoute dashboard…"
        }
      />
    );
  }
  return <>{children}</>;
}
