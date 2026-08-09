import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Privacy policy" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>
          IndiRoute processes account, package, shipment, payment metadata, support, and
          warehouse operations data to provide parcel forwarding.
        </p>
        <p>
          <strong>Processors.</strong> Firebase Authentication & Cloud Firestore (Google),
          Stripe (payments), Resend (transactional email), and Vercel (hosting).
        </p>
        <p>
          <strong>Package photos.</strong> Receive and exception photos are stored privately
          and shown to the package owner and authorized staff. Retention targets at least
          dispute windows / 12 months operational need.
        </p>
        <p>
          <strong>No wallet balances</strong> are stored. Payment records reflect Stripe
          charges and refunds only.
        </p>
        <p>
          Contact privacy requests via the Contact page or support email configured for
          Beta.
        </p>
      </Panel>
    </div>
  );
}
