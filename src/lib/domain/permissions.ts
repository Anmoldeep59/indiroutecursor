import type { StaffRole } from "@/lib/config/frozen";

export type Actor =
  | { kind: "customer"; uid: string }
  | { kind: "staff"; uid: string; role: StaffRole };

export type Permission =
  | "view_own_packages"
  | "create_consolidation"
  | "request_quote"
  | "pay"
  | "create_ticket"
  | "receive_package"
  | "open_package"
  | "reassign_package"
  | "mark_shipped"
  | "update_milestones"
  | "edit_rates"
  | "edit_settings"
  | "refund"
  | "dispose"
  | "manage_staff"
  | "view_audit"
  | "force_status_override";

const WAREHOUSE: Permission[] = [
  "receive_package",
  "open_package",
  "mark_shipped",
  "update_milestones",
];

const SUPER: Permission[] = [
  ...WAREHOUSE,
  "reassign_package",
  "edit_rates",
  "edit_settings",
  "refund",
  "dispose",
  "manage_staff",
  "view_audit",
  "force_status_override",
];

const CUSTOMER: Permission[] = [
  "view_own_packages",
  "create_consolidation",
  "request_quote",
  "pay",
  "create_ticket",
];

export function can(actor: Actor, permission: Permission): boolean {
  if (actor.kind === "customer") return CUSTOMER.includes(permission);
  if (actor.role === "super_admin") return SUPER.includes(permission);
  return WAREHOUSE.includes(permission);
}

export function assertCan(actor: Actor, permission: Permission): void {
  if (!can(actor, permission)) {
    throw new Error(`Forbidden: ${permission}`);
  }
}

export const DANGEROUS_ACTIONS_REQUIRING_CONFIRM = [
  "reassign_package",
  "open_package",
  "refund",
  "dispose",
  "edit_rates",
  "edit_settings",
  "force_status_override",
  "manage_staff",
] as const;
