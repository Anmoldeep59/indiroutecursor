"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";

/** Login/signup — authenticated users leave guest pages */
export function GuestOnly({ children }: { children: React.ReactNode }) {
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

  if (!configured) return <>{children}</>;
  if (loading) return <AuthSplash />;
  if (user) {
    return (
      <AuthSplash
        message={needsOtp ? "Taking you to email verification…" : "Taking you to your dashboard…"}
      />
    );
  }
  return <>{children}</>;
}
