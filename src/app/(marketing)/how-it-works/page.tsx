import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "How it works" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="How it works" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
        <p>1. Sign up and verify your email.</p>
        <p>2. Receive your permanent IND-XXXXXX and India warehouse address.</p>
        <p>3. Shop Indian websites and include your IND on the label.</p>
        <p>4. We receive, photograph, weigh, and store your parcels (20 free calendar days from Stored).</p>
        <p>5. Optionally consolidate, then request an AUD shipping quote based on warehouse measurements.</p>
        <p>6. Pay via Stripe (no wallet). We dispatch manually and you track in your account.</p>
        <p>Australia duties and taxes are your responsibility.</p>
      </Panel>
    </div>
  );
}
