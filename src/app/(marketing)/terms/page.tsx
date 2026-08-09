import type { Metadata } from "next";
import { PageTitle, Panel, Alert } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Terms of service" subtitle="Beta terms aligned to the Frozen Beta Specification." />
      <Alert tone="warn" >
        [FOUNDER INPUT REQUIRED] Final legal entity name and lawyer-reviewed abandonment /
        unidentified disposal wording.
      </Alert>
      <Panel className="mt-4 space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>
          IndiRoute provides an India receiving address, storage, optional consolidation,
          and international forwarding. Beta shipping destination is Australia only.
        </p>
        <p>
          <strong>Customer ID.</strong> After email verification you receive a permanent
          IND-XXXXXX. IDs are never recycled.
        </p>
        <p>
          <strong>Storage.</strong> Free storage is 20 calendar days beginning when a
          package first becomes Stored. Thereafter storage accrues at ₹100 per package per
          calendar day. Accrued storage must be settled when you pay to ship (AUD
          presentation configured by IndiRoute).
        </p>
        <p>
          <strong>Abandonment (target).</strong> IndiRoute may treat packages as abandoned
          around 90 days from Stored, subject to final Terms/legal review, required notices,
          and applicable law. Disposal is never automatic at day 30 for unidentified parcels
          and is never performed by an unattended system job in Beta.
        </p>
        <p>
          <strong>Unidentified parcels.</strong> Unidentified parcels receive a 30-day
          investigation/claim window. No automatic disposal occurs at day 30. Further
          handling follows these Terms, notices, legal requirements, and approved warehouse
          policy.
        </p>
        <p>
          <strong>Inspection.</strong> Packages are not routinely opened. Opening occurs
          only for documented damage, prohibited-item concerns, customer-authorized
          inspection, or legitimate Assisted Purchase verification (Assisted Purchase itself
          is not offered in Beta). Openings are logged and photographed.
        </p>
        <p>
          <strong>Payments.</strong> There is no customer wallet, stored balance, or credit
          ledger. Charges are paid directly via Stripe in AUD when due.
        </p>
        <p>
          <strong>Customs & duties.</strong> You must provide honest customs descriptions
          and values. Destination duties, taxes, and brokerage in Australia are your
          responsibility and are not collected by IndiRoute in Beta.
        </p>
        <p>
          <strong>Prohibited goods.</strong> You must not send prohibited items. IndiRoute
          may refuse, hold, or escalate packages that appear restricted or unlawful.
        </p>
        <p>
          <strong>Liability.</strong> Service is provided as a Beta logistics operation.
          Liability caps and claim processes will follow the founder-approved legal pack.
        </p>
      </Panel>
    </div>
  );
}
