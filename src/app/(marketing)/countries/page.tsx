import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Countries we ship to" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Countries we ship to" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p><strong>Live in Beta:</strong> Australia.</p>
        <p>Other destinations are not available for checkout during Beta.</p>
      </Panel>
    </div>
  );
}
