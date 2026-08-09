import type { Metadata } from "next";
import { PageTitle, Panel, Alert } from "@/components/ui/ui";

export const metadata: Metadata = { title: "Prohibited & restricted items" };

export default function ProhibitedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle
        title="Prohibited & restricted items"
        subtitle="Beta air services to Australia. Final launch bans require founder confirmation."
      />
      <Alert tone="warn">
        [FOUNDER INPUT REQUIRED] Confirm final AU air bans for perfume, batteries, food,
        and medicines before launch.
      </Alert>
      <div className="mt-6 space-y-4">
        <Panel>
          <h2 className="font-semibold">Prohibited</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            Weapons, explosives, illegal drugs, and other unlawful goods. Currency/bullion
            generally refused.
          </p>
        </Panel>
        <Panel>
          <h2 className="font-semibold">Restricted / courier or country dependent</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            Perfumes, aerosols, liquids, lithium batteries, alcohol, chemicals, plants,
            seeds, medicines, and many foods. When unsure, contact support before shipping
            to our warehouse.
          </p>
        </Panel>
        <Panel>
          <h2 className="font-semibold">Allowed with care</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
            Most general retail goods and electronics without restricted batteries, subject
            to honest customs declarations.
          </p>
        </Panel>
      </div>
    </div>
  );
}
