import fs from "fs";
import path from "path";

const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log("wrote", rel);
}

function simple(title, paragraphs) {
  const body = paragraphs
    .map((p) => `        <p>${p}</p>`)
    .join("\n");
  return `import type { Metadata } from "next";
import { PageTitle, Panel } from "@/components/ui/ui";

export const metadata: Metadata = { title: "${title}" };

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <PageTitle title="${title}" />
      <Panel className="space-y-4 text-sm text-[color:var(--ink-soft)]">
${body}
      </Panel>
    </div>
  );
}
`;
}

w(
  "src/app/(marketing)/how-it-works/page.tsx",
  simple("How it works", [
    "1. Sign up and verify your email.",
    "2. Receive your permanent IND-XXXXXX and India warehouse address.",
    "3. Shop Indian websites and include your IND on the label.",
    "4. We receive, photograph, weigh, and store your parcels (20 free calendar days from Stored).",
    "5. Optionally consolidate, then request an AUD shipping quote based on warehouse measurements.",
    "6. Pay via Stripe (no wallet). We dispatch manually and you track in your account.",
    "Australia duties and taxes are your responsibility.",
  ]),
);

w(
  "src/app/(marketing)/pricing/page.tsx",
  simple("Pricing", [
    "<strong>International shipping:</strong> priced from admin-managed AUD sell-rate cards after warehouse weigh-in.",
    "<strong>Handling fee:</strong> shown as a line item when configured. Amount is set from real costs.",
    "<strong>Storage:</strong> 20 calendar days free from Stored, then ₹100 per package per calendar day.",
    "<strong>Not included:</strong> Australian import duties, taxes, or brokerage.",
    "<strong>No wallet:</strong> you pay directly when a charge is due.",
    "Assisted Purchase is not part of Beta.",
  ]),
);

w(
  "src/app/(marketing)/countries/page.tsx",
  simple("Countries we ship to", [
    "<strong>Live in Beta:</strong> Australia.",
    "Other destinations are not available for checkout during Beta.",
  ]),
);

w(
  "src/app/(marketing)/faq/page.tsx",
  simple("FAQ", [
    "<strong>When does free storage start?</strong> When your package first becomes Stored.",
    "<strong>Do you open packages?</strong> Not routinely. Only for documented damage, prohibited concerns, your authorization, or legitimate verification — always logged and photographed.",
    "<strong>Is the calculator the final price?</strong> No. Payable quotes use warehouse measurements only and expire in 48 hours.",
    "<strong>Who pays Australian duties?</strong> You do.",
    "<strong>Is there a wallet?</strong> No.",
  ]),
);

w(
  "src/app/(marketing)/about/page.tsx",
  simple("About us", [
    "IndiRoute is an India-based parcel forwarding service for overseas shoppers. Beta focuses on India → Australia.",
    '<span className="text-amber-800">[FOUNDER INPUT REQUIRED] Legal entity name and registered details.</span>',
    "Website: indiroute.co",
  ]),
);

console.log("done");
