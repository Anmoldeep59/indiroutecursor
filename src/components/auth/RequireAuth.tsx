"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

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
      <div className="p-8 text-sm text-amber-800">
        Configure Firebase client environment variables to use this area.
      </div>
    );
  }
  if (loading || !user) {
    return <div className="p-8 text-sm text-[color:var(--muted)]">Loading…</div>;
  }
  if (staffOnly && !staff) {
    return <div className="p-8 text-sm">Staff access required.</div>;
  }
  if (superAdminOnly && staff?.role !== "super_admin") {
    return <div className="p-8 text-sm">Super Admin only.</div>;
  }
  return <>{children}</>;
}
