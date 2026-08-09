import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "About us" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="About us" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>IndiRoute is an India-based parcel forwarding service for overseas shoppers. Beta focuses on India → Australia.</p>
        <p><span className="text-amber-800">[FOUNDER INPUT REQUIRED] Legal entity name and registered details.</span></p>
        <p>Website: indiroute.co</p>
      </Panel>
    </div>
  );
}
