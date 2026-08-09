import { DashboardNav } from "@/components/layout/DashboardNav";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardNav />
        <div className="flex-1 px-4 py-6 md:px-8">{children}</div>
      </div>
    </RequireAuth>
  );
}
