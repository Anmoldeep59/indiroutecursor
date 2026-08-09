import type { PackageStatus } from "@/lib/config/frozen";

/** Permitted transitions per Frozen Beta Spec §4 */
const TRANSITIONS: Record<PackageStatus, PackageStatus[]> = {
  Incoming: ["Received", "Unidentified", "Exception", "Disposed"],
  Received: ["Inspection", "Action Required", "Exception", "Disposed"],
  Inspection: ["Stored", "Action Required", "Unidentified", "Exception", "Disposed"],
  Stored: [
    "Consolidation Requested",
    "Awaiting Payment",
    "Action Required",
    "Exception",
    "Disposed",
  ],
  "Action Required": ["Stored", "Inspection", "Exception", "Disposed"],
  "Consolidation Requested": ["Packing", "Stored", "Exception", "Disposed"],
  Packing: ["Stored", "Exception", "Disposed"],
  "Awaiting Payment": ["Ready to Ship", "Stored", "Exception", "Disposed", "Refund Review"],
  "Ready to Ship": ["Shipped", "Awaiting Payment", "Exception", "Disposed", "Refund Review"],
  Shipped: ["In Transit", "Customs", "Out for Delivery", "Delivered", "Returned", "Exception"],
  "In Transit": ["Customs", "Out for Delivery", "Delivered", "Returned", "Exception"],
  Customs: ["In Transit", "Out for Delivery", "Delivered", "Returned", "Exception"],
  "Out for Delivery": ["Delivered", "Returned", "Exception"],
  Delivered: [],
  Returned: ["Exception", "Disposed", "Stored"],
  Exception: ["Stored", "Action Required", "Disposed", "Refund Review"],
  Unidentified: ["Quarantine", "Inspection", "Stored", "Exception", "Disposed"],
  Quarantine: ["Unidentified", "Inspection", "Stored", "Exception", "Disposed"],
  Disposed: [],
  "Refund Review": ["Stored", "Awaiting Payment", "Ready to Ship", "Exception", "Disposed"],
};

export function canTransition(from: PackageStatus, to: PackageStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: PackageStatus, to: PackageStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal package status transition: ${from} → ${to}`);
  }
}

export const CUSTOMER_FACING: PackageStatus[] = [
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
];

export function isCustomerVisible(status: PackageStatus): boolean {
  return CUSTOMER_FACING.includes(status);
}

export function isShippableStatus(status: PackageStatus): boolean {
  return status === "Stored";
}
