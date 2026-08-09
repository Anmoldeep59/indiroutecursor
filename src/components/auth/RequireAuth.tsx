"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthSplash } from "@/components/auth/AuthSplash";
import type { StaffProfile } from "@/lib/types";

export function RequireAuth({
  children,
  staffOnly = false,
  superAdminOnly = false,
}: {
  children: React.ReactNode;
  staffOnly?: boolean;
  superAdminOnly?: boolean;
}) {
  const { user, staff, loading, configured, getIdToken } = useAuth();
  const router = useRouter();
  const [staffGate, setStaffGate] = useState<StaffProfile | null | undefined>(
    undefined,
  );

  const effectiveStaff = staff ?? staffGate ?? null;

  useEffect(() => {
    if (!staffOnly || loading || !configured || !user) {
      setStaffGate(undefined);
      return;
    }
    if (staff?.active) {
      setStaffGate(staff);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const token = await getIdToken(true);
        if (!token || cancelled) return;
        const res = await fetch("/api/admin/session", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.isStaff && data.staff) {
          setStaffGate(data.staff as StaffProfile);
        } else {
          setStaffGate(null);
        }
      } catch {
        if (!cancelled) setStaffGate(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [staffOnly, loading, configured, user, staff, getIdToken]);

  useEffect(() => {
    if (loading) return;
    if (!configured) return;
    if (!user) {
      router.replace(staffOnly ? "/staff-login" : "/login");
      return;
    }
    if (staffOnly && staffGate === null && !staff) {
      router.replace("/staff-login");
    }
    if (
      superAdminOnly &&
      effectiveStaff &&
      effectiveStaff.role !== "super_admin"
    ) {
      router.replace("/admin");
    }
  }, [
    user,
    staff,
    staffGate,
    effectiveStaff,
    loading,
    configured,
    router,
    staffOnly,
    superAdminOnly,
  ]);

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
  if (staffOnly && !effectiveStaff) {
    if (staffGate === undefined && !staff) {
      return <AuthSplash message="Checking admin access…" />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8 text-sm text-zinc-100">
        Staff access required.{" "}
        <a href="/staff-login" className="ml-2 underline">
          Staff login
        </a>
      </div>
    );
  }
  if (superAdminOnly && effectiveStaff?.role !== "super_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8 text-sm text-zinc-100">
        Super Admin only.
      </div>
    );
  }
  return <>{children}</>;
}
