import type { PackageStatus, StaffRole } from "@/lib/config/frozen";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  indId: string | null;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  role: "customer";
};

export type StaffProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: StaffRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PackagePhoto = {
  id: string;
  kind: "exterior" | "label" | "damage" | "contents" | "consolidation" | "dispatch";
  storagePath: string;
  url?: string;
  createdAt: string;
  createdBy: string;
};

export type PackageRecord = {
  id: string;
  barcode: string;
  userId: string | null;
  indId: string | null;
  status: PackageStatus;
  senderStore?: string;
  inboundTracking?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  condition?: "ok" | "damaged" | "suspect_prohibited";
  binLocation?: string;
  photos: PackagePhoto[];
  storedAt?: string;
  storageWarningsSent?: number[];
  consolidationId?: string;
  consolidatedIntoId?: string;
  memberPackageIds?: string[];
  shipmentId?: string;
  opened?: {
    reason: string;
    at: string;
    by: string;
    photoIds: string[];
  };
  actionRequiredReason?: string;
  unidentifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsolidationRecord = {
  id: string;
  userId: string;
  packageIds: string[];
  status: "requested" | "packing" | "completed" | "cancelled";
  resultingPackageId?: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryAddress = {
  id: string;
  userId: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: "AU";
  phone?: string;
  isDefault?: boolean;
};

export type QuoteOption = {
  serviceId: string;
  serviceName: string;
  courierName: string;
  etaDaysMin: number;
  etaDaysMax: number;
  shippingAudCents: number;
  handlingAudCents: number;
  storageAudCents: number;
  totalAudCents: number;
};

export type ShippingQuote = {
  id: string;
  userId: string;
  packageIds: string[];
  chargeableWeightKg: number;
  actualWeightKg: number;
  volumetricWeightKg: number;
  destination: Omit<DeliveryAddress, "id" | "userId" | "label" | "isDefault">;
  options: QuoteOption[];
  selectedServiceId?: string;
  status: "open" | "selected" | "paid" | "expired" | "invalidated";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ShipmentRecord = {
  id: string;
  userId: string;
  packageIds: string[];
  quoteId: string;
  paymentId?: string;
  status: PackageStatus;
  courierName?: string;
  trackingNumber?: string;
  customsItems: {
    description: string;
    quantity: number;
    valueAudCents: number;
    originCountry: string;
  }[];
  destination: ShippingQuote["destination"];
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  purpose: "shipping" | "storage";
  amountAudCents: number;
  currency: "aud";
  status: "pending" | "succeeded" | "failed" | "refunded" | "partial_refund";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  quoteId?: string;
  shipmentId?: string;
  lineItems: { label: string; amountAudCents: number }[];
  createdAt: string;
  updatedAt: string;
};

export type InvoiceRecord = {
  id: string;
  userId: string;
  paymentId: string;
  number: string;
  lineItems: { label: string; amountAudCents: number }[];
  totalAudCents: number;
  currency: "aud";
  createdAt: string;
};

export type RefundRecord = {
  id: string;
  paymentId: string;
  amountAudCents: number;
  reason: string;
  createdBy: string;
  stripeRefundId?: string;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  userId: string;
  category:
    | "package_not_showing"
    | "package_damaged"
    | "tracking"
    | "shipping"
    | "payment"
    | "consolidation"
    | "customs"
    | "refund"
    | "account"
    | "technical"
    | "other";
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "p0" | "p1" | "p2";
  messages: {
    id: string;
    authorId: string;
    authorRole: "customer" | "staff";
    body: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type RateCard = {
  id: string;
  serviceId: string;
  serviceName: string;
  courierName: string;
  destinationCountry: "AU";
  etaDaysMin: number;
  etaDaysMax: number;
  active: boolean;
  /** weight break upper bound kg → price AUD cents */
  breaks: { upToKg: number; priceAudCents: number }[];
  updatedAt: string;
  updatedBy: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  createdAt: string;
};

export type AppSettings = {
  storageFreeDays: number;
  storageFeeInrPerDay: number;
  abandonmentTargetDays: number;
  unidentifiedClaimDays: number;
  quoteValidityHours: number;
  warehouseAddressConfigured: boolean;
};
