import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Refund policy" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>
          <strong>International shipping.</strong> Before dispatch / label purchase: shipping
          and handling may be refunded in full (storage already accrued may remain due).
          After dispatch: shipping is generally non-refundable except for IndiRoute error
          (wrong address by staff, never shipped, duplicate charge). Courier delay alone is
          not a refund reason.
        </p>
        <p>
          <strong>Storage.</strong> Storage fees are generally non-refundable once charged
          for a calendar day.
        </p>
        <p>
          <strong>Assisted Purchase.</strong> Not offered in Beta. When launched (P1),
          refunds follow the separate Assisted Purchase rules in the PRD.
        </p>
        <p>
          <strong>No wallet credits.</strong> Refunds are issued back through Stripe, not as
          account balance.
        </p>
        <p>
          Partial refunds are performed only by Super Admin with confirmation and audit
          logging.
        </p>
      </Panel>
    </div>
  );
}
