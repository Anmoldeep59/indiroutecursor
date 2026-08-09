import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Pricing" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p><strong>International shipping:</strong> priced from admin-managed AUD sell-rate cards after warehouse weigh-in.</p>
        <p><strong>Handling fee:</strong> shown as a line item when configured. Amount is set from real costs.</p>
        <p><strong>Storage:</strong> 20 calendar days free from Stored, then ₹100 per package per calendar day.</p>
        <p><strong>Not included:</strong> Australian import duties, taxes, or brokerage.</p>
        <p><strong>No wallet:</strong> you pay directly when a charge is due.</p>
        <p>Assisted Purchase is not part of Beta.</p>
      </Panel>
    </div>
  );
}
