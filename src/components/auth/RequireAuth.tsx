"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";

export function RequireAuth({
  children,
  staffOnly = false,
  superAdminOnly = false,
}: {
  children: React.ReactNode;
  staffOnly?: boolean;
  superAdminOnly?: boolean;
}) {
  const { user, staff, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      router.replace(staffOnly ? "/staff-login" : "/login");
      return;
    }
    if (staffOnly && !staff) {
      router.replace("/dashboard");
    }
    if (superAdminOnly && staff?.role !== "super_admin") {
      router.replace("/admin");
    }
  }, [user, staff, loading, configured, router, staffOnly, superAdminOnly]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--ivory)] p-8 text-sm text-amber-900">
        Configure Firebase client environment variables to use this area.
      </div>
    );
  }
  if (loading || !user) {
    return <AuthSplash message="Checking your session…" />;
  }
  if (staffOnly && !staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--ivory)] p-8 text-sm text-[color:var(--ink)]">
        Staff access required.
      </div>
    );
  }
  if (superAdminOnly && staff?.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--ivory)] p-8 text-sm text-[color:var(--ink)]">
        Super Admin only.
      </div>
    );
  }
  return <>{children}</>;
}
