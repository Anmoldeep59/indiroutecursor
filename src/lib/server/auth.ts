import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { StaffProfile, UserProfile } from "@/lib/types";
import type { Actor } from "@/lib/domain/permissions";

export async function verifyBearerToken(
  authorizationHeader: string | null,
): Promise<{ uid: string; email?: string; emailVerified: boolean } | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  if (!isAdminConfigured()) return null;
  const token = authorizationHeader.slice("Bearer ".length);
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: Boolean(decoded.email_verified),
    };
  } catch {
    return null;
  }
}

export async function getCustomerProfile(
  uid: string,
): Promise<UserProfile | null> {
  const snap = await adminDb().collection(COLLECTIONS.users).doc(uid).get();
  return snap.exists ? (snap.data() as UserProfile) : null;
}

export async function getStaffProfile(
  uid: string,
): Promise<StaffProfile | null> {
  const snap = await adminDb().collection(COLLECTIONS.staff).doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() as StaffProfile;
  if (!data.active) return null;
  return data;
}

export async function resolveActor(
  authorizationHeader: string | null,
): Promise<Actor | null> {
  const identity = await verifyBearerToken(authorizationHeader);
  if (!identity) return null;
  const staff = await getStaffProfile(identity.uid);
  if (staff) return { kind: "staff", uid: identity.uid, role: staff.role };
  return { kind: "customer", uid: identity.uid };
}

export async function requireCustomer(
  authorizationHeader: string | null,
): Promise<{ identity: NonNullable<Awaited<ReturnType<typeof verifyBearerToken>>>; profile: UserProfile }> {
  const identity = await verifyBearerToken(authorizationHeader);
  if (!identity) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const profile = await getCustomerProfile(identity.uid);
  if (!profile) throw new Response(JSON.stringify({ error: "Profile required" }), { status: 403 });
  return { identity, profile };
}

export async function requireStaff(
  authorizationHeader: string | null,
  roles?: Array<"warehouse_staff" | "super_admin">,
): Promise<{ identity: NonNullable<Awaited<ReturnType<typeof verifyBearerToken>>>; staff: StaffProfile }> {
  const identity = await verifyBearerToken(authorizationHeader);
  if (!identity) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const staff = await getStaffProfile(identity.uid);
  if (!staff) throw new Response(JSON.stringify({ error: "Staff only" }), { status: 403 });
  if (roles && !roles.includes(staff.role)) {
    throw new Response(JSON.stringify({ error: "Insufficient role" }), { status: 403 });
  }
  return { identity, staff };
}
