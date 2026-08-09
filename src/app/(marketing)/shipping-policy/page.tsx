import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Shipping policy" };

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="Shipping policy" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>
          <strong>Corridor.</strong> Beta ships India → Australia only.
        </p>
        <p>
          <strong>Estimates vs payable quotes.</strong> The public calculator is an estimate.
          Payable quotes are generated only from warehouse-recorded final weight and
          dimensions, using admin-managed AUD sell-rate cards. Live FX is not used for
          customer shipping quotes in Beta.
        </p>
        <p>
          <strong>Chargeable weight.</strong> The greater of actual weight and volumetric
          weight. The volumetric divisor is configured by IndiRoute before launch charging.
        </p>
        <p>
          <strong>Quote validity.</strong> Payable quotes expire 48 hours after creation.
          Expired quotes cannot be paid; regenerate after expiry or after consolidation
          re-measurement.
        </p>
        <p>
          <strong>Dispatch.</strong> Dispatch occurs only after Stripe payment success
          (webhook confirmed). Couriers are booked manually in Beta; tracking is entered by
          staff and visible in your logged-in account.
        </p>
        <p>
          <strong>Delivery times</strong> are estimates, not guarantees.
        </p>
        <p>
          <strong>Duties & taxes</strong> in Australia are paid by the customer to the
          carrier/authorities as required.
        </p>
      </Panel>
    </div>
  );
}
