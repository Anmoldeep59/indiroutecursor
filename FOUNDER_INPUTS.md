# IndiRoute Beta — Founder Inputs Required

Engineering must **not invent** these values. Until provided, charging/launch features that depend on them remain blocked or use explicit `null` placeholders.

| # | Input | Status | Used for |
|---|--------|--------|----------|
| 1 | Legal entity name + registered details for About/Terms | **REQUIRED** | Legal pages, invoices |
| 2 | Full customer-facing warehouse address block | **REQUIRED** | Dashboard address, labels |
| 3 | Handling fee AUD amount/structure (or explicit `$0`) | **REQUIRED before launch charging** | Quotes, Stripe line items |
| 4 | AUD presentation rule for ₹100/day storage on Stripe | **REQUIRED before charging storage** | Checkout storage line |
| 5 | Volumetric weight divisor (e.g. 5000) | **REQUIRED** | Chargeable weight |
| 6 | Initial AUD sell-rate card values (services × weight breaks) | **REQUIRED** | Payable quotes |
| 7 | Beta courier(s) + account ownership | **REQUIRED** | Dispatch ops |
| 8 | Stripe account readiness (AUD) + statement descriptor | **REQUIRED** | Payments |
| 9 | Max declared value before Super Admin review | **REQUIRED** | Ship flow |
| 10 | Customer email-change in Beta: yes/no | **REQUIRED** (recommend: no / P1) | Security settings |
| 11 | IND alphabet exclusion set (recommend exclude `0,O,1,I,L`) | **REQUIRED** | IND generator |
| 12 | Final Terms text for 90-day abandonment + unidentified post-30 handling | **REQUIRED (legal)** | Dispose / Terms |
| 13 | Support from-email domain/DNS for Resend | **REQUIRED** | Transactional email |
| 14 | Final prohibited list for AU air (perfume, batteries, food, medicines) | **REQUIRED** | Prohibited page + ops |

## Frozen (do not change without founder approval)

- Corridor: India → Australia only
- Free storage: 20 calendar days from first `Stored`
- Storage after free: ₹100 per package per calendar day
- Abandonment target: 90 days (Terms/legal review)
- IND: `IND-XXXXXX`, permanent, never recycled
- No routine package opening
- Payable quotes: warehouse measurements only; 48h validity
- Checkout: AUD only; admin AUD sell-rate cards; no live FX
- Assisted Purchase: P1 (not Beta)
- Public tracking: P1
- No courier APIs in Beta
- No wallet / balance / credit ledger
- Unidentified: 30-day investigation; no auto-disposal at day 30

## How to supply

Set values in `.env.local` (see `.env.example`) and/or Admin → Settings after Super Admin bootstrap. Leave unset rather than guessing.
