import { AdminNav } from "@/components/layout/AdminNav";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth staffOnly>
      <div className="flex min-h-screen flex-col bg-zinc-900 text-zinc-100 md:flex-row">
        <AdminNav />
        <div className="admin-surface flex-1 px-4 py-6 text-zinc-100 md:px-8">
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
