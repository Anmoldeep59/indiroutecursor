# IndiRoute (Beta)

India → Australia parcel forwarding. Built from the **IndiRoute Frozen Beta Specification**.

**Stack:** Next.js · Tailwind · Firebase Auth · Cloud Firestore · Stripe (AUD) · Resend · Vercel

## Hard rules

- No customer wallet / balance / credit ledger
- Payable quotes use warehouse measurements only (48h expiry)
- Checkout currency: AUD; admin sell-rate cards; no live FX
- Assisted Purchase, public tracking, courier APIs: **not in Beta**
- Storage: 20 free calendar days from `Stored`, then ₹100/package/day
- Packages are not routinely opened

## Setup

1. Copy `.env.example` → `.env.local` and fill Firebase, Stripe, Resend, and **founder inputs**.
2. See [`FOUNDER_INPUTS.md`](./FOUNDER_INPUTS.md) for launch blockers.
3. Deploy `firestore.rules` and `storage.rules`.
4. Bootstrap a Super Admin: create Firebase Auth user, then create Firestore `staff/{uid}`:

```json
{
  "uid": "<uid>",
  "email": "ops@indiroute.co",
  "displayName": "Ops",
  "role": "super_admin",
  "active": true,
  "createdAt": "<iso>",
  "updatedAt": "<iso>"
}
```

5. `npm install` · `npm run dev`
6. Configure Stripe webhook → `POST /api/webhooks/stripe` (`checkout.session.completed`).

## Scripts

- `npm run dev` — local app
- `npm run build` — production build
- `npm run lint` — ESLint

## Key routes

| Area | Path |
|------|------|
| Marketing | `/`, `/how-it-works`, `/pricing`, `/shipping-calculator`, … |
| Customer | `/dashboard/*` |
| Staff login | `/staff-login` |
| Admin | `/admin/*` |
| Stripe webhook | `/api/webhooks/stripe` |

## Not in Beta

Assisted Purchase · public tracking · courier API booking · live FX · non-AU checkout · wallets · auto-disposal jobs
