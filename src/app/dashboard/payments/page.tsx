import { Suspense } from "react";
import { PaymentsClient } from "./PaymentsClient";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[color:var(--muted)]">Loading payments…</p>}>
      <PaymentsClient />
    </Suspense>
  );
}
