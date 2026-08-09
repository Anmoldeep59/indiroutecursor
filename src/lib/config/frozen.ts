/**
 * Frozen Beta constants — do not change without founder approval.
 * Source: IndiRoute Frozen Beta Specification
 */

export const FROZEN = {
  corridorOrigin: "IN",
  corridorDestination: "AU",
  checkoutCurrency: "aud",
  freeStorageDays: 20,
  storageFeeInrPerDay: 100,
  storageWarningDays: [15, 18, 20] as const,
  abandonmentTargetDays: 90,
  unidentifiedClaimDays: 30,
  quoteValidityHours: 48,
  indPrefix: "IND-",
  indBodyLength: 6,
  /** Default alphabet excluding visually ambiguous 0,O,1,I,L — override via founder input */
  defaultIndAlphabet: "23456789ABCDEFGHJKMNPQRSTUVWXYZ",
  assistedPurchaseInBeta: false,
  publicTrackingInBeta: false,
  courierApisInBeta: false,
  walletAllowed: false,
  liveFxQuotesInBeta: false,
  routinePackageOpening: false,
  autoDisposeUnidentified: false,
} as const;

export const CUSTOMER_VISIBLE_STATUSES = [
  "Received",
  "Inspection",
  "Stored",
  "Action Required",
  "Consolidation Requested",
  "Packing",
  "Awaiting Payment",
  "Ready to Ship",
  "Shipped",
  "In Transit",
  "Customs",
  "Out for Delivery",
  "Delivered",
  "Returned",
  "Exception",
] as const;

export const INTERNAL_STATUSES = [
  "Incoming",
  "Unidentified",
  "Quarantine",
  "Disposed",
  "Refund Review",
] as const;

export type CustomerVisibleStatus = (typeof CUSTOMER_VISIBLE_STATUSES)[number];
export type InternalStatus = (typeof INTERNAL_STATUSES)[number];
export type PackageStatus = CustomerVisibleStatus | InternalStatus;

export const STAFF_ROLES = ["warehouse_staff", "super_admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
