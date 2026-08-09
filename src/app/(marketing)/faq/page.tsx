import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="FAQ" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p><strong>When does free storage start?</strong> When your package first becomes Stored.</p>
        <p><strong>Do you open packages?</strong> Not routinely. Only for documented damage, prohibited concerns, your authorization, or legitimate verification — always logged and photographed.</p>
        <p><strong>Is the calculator the final price?</strong> No. Payable quotes use warehouse measurements only and expire in 48 hours.</p>
        <p><strong>Who pays Australian duties?</strong> You do.</p>
        <p><strong>Is there a wallet?</strong> No.</p>
      </Panel>
    </div>
  );
}
