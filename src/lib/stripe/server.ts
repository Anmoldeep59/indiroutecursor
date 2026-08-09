import Stripe from "stripe";
import { FROZEN } from "@/lib/config/frozen";
import { getFounderSettings } from "@/lib/config/founder-settings";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
    });
  }
  return stripe;
}

export async function createShippingCheckoutSession(input: {
  userId: string;
  email: string;
  quoteId: string;
  shipmentId: string;
  paymentId: string;
  lineItems: { label: string; amountAudCents: number }[];
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (FROZEN.walletAllowed) {
    throw new Error("Wallet is forbidden in Beta");
  }
  const settings = getFounderSettings();
  const stripeClient = getStripe();

  return stripeClient.checkout.sessions.create({
    mode: "payment",
    customer_email: input.email,
    client_reference_id: input.userId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    payment_intent_data: {
      statement_descriptor: settings.stripeStatementDescriptor.slice(0, 22),
      metadata: {
        userId: input.userId,
        quoteId: input.quoteId,
        shipmentId: input.shipmentId,
        paymentId: input.paymentId,
        purpose: "shipping",
      },
    },
    metadata: {
      userId: input.userId,
      quoteId: input.quoteId,
      shipmentId: input.shipmentId,
      paymentId: input.paymentId,
      purpose: "shipping",
    },
    line_items: input.lineItems.map((item) => ({
      quantity: 1,
      price_data: {
        currency: FROZEN.checkoutCurrency,
        unit_amount: item.amountAudCents,
        product_data: { name: item.label },
      },
    })),
  });
}
