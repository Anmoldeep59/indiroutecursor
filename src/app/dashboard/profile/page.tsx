"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { PageTitle, Panel } from "@/components/ui/ui";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  return (
    <div>
      <PageTitle title="Profile" />
      <Panel className="space-y-2 text-sm">
        <p>Name: {profile?.displayName || user?.displayName || "—"}</p>
        <p>Email: {profile?.email || user?.email}</p>
        <p>IND: {profile?.indId || "Unavailable until verified"}</p>
        <p>Email verified: {user?.emailVerified || profile?.emailVerified ? "Yes" : "No"}</p>
      </Panel>
    </div>
  );
}
