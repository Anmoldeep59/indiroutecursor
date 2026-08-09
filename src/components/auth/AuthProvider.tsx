"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getClientAuth,
  getClientDb,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { passwordResetActionCodeSettings } from "@/lib/auth/actionCode";
import { authErrorMessage } from "@/lib/auth/errors";
import type { StaffProfile, UserProfile } from "@/lib/types";

// IMPORTANT: Do not import sendEmailVerification / applyActionCode / checkActionCode.
// Manual signup verification is Resend-only via /api/auth/send-verification.

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  profile: UserProfile | null;
  staff: StaffProfile | null;
  loading: boolean;
  emailVerified: boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  ensureProfile: () => Promise<UserProfile | null>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const RESEND_COOLDOWN_MS = 60_000;

async function callSendVerification(
  idToken: string,
  displayName: string,
): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
  cooldownSeconds?: number;
  messageId?: string;
}> {
  const res = await fetch("/api/auth/send-verification", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ displayName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: data.error || "Could not send verification email",
      cooldownSeconds: data.cooldownSeconds,
    };
  }
  if (data.messageId) {
    console.info("[auth] Resend message ID", data.messageId);
  }
  return { ok: true, message: data.message, messageId: data.messageId };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const lastResendAt = useRef(0);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ir_verify_resend_at");
      if (stored) lastResendAt.current = Number(stored) || 0;
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const auth = getClientAuth();
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return () => unsub();
  }, [configured]);

  useEffect(() => {
    if (!configured || !user) {
      setProfile(null);
      setStaff(null);
      return;
    }
    const db = getClientDb();
    const unsubUser = onSnapshot(doc(db, COLLECTIONS.users, user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
    });
    // Prefer server session for staff (avoids client rules gaps); keep snapshot as live update
    void (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.isStaff && data.staff) {
          setStaff(data.staff as StaffProfile);
        } else if (res.ok) {
          setStaff(null);
        }
      } catch {
        /* snapshot below may still populate */
      }
    })();

    const unsubStaff = onSnapshot(
      doc(db, COLLECTIONS.staff, user.uid),
      (snap) => {
        // Server /api/admin/session is source of truth. Only upgrade from snapshot
        // when a live active staff doc is readable — never clear on missing/denied.
        if (!snap.exists()) return;
        const data = snap.data() as StaffProfile;
        if (data.active !== false) setStaff(data);
      },
      () => {
        /* permission-denied: keep server session result if any */
      },
    );
    return () => {
      unsubUser();
      unsubStaff();
    };
  }, [configured, user]);

  const getIdToken = useCallback(
    async (forceRefresh = false) => {
      if (!user) return null;
      return user.getIdToken(forceRefresh);
    },
    [user],
  );

  const ensureProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch("/api/auth/ensure-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: user.displayName ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[ensure-profile]", data.error || res.status);
        return null;
      }
      if (data.profile) setProfile(data.profile as UserProfile);
      return data.profile as UserProfile;
    } catch (err) {
      console.error("[ensure-profile] network/error", err);
      return null;
    }
  }, [user]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const auth = getClientAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const token = await cred.user.getIdToken(true);
    const profileRes = await fetch("/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: name }),
    });
    if (!profileRes.ok) {
      const data = await profileRes.json().catch(() => ({}));
      console.error("[auth] ensure-profile after signup failed", data);
    }

    // Custom Resend verification — NOT Firebase sendEmailVerification
    const send = await callSendVerification(token, name);
    lastResendAt.current = Date.now();
    try {
      sessionStorage.setItem("ir_verify_resend_at", String(lastResendAt.current));
    } catch {
      /* ignore */
    }
    if (!send.ok) {
      // Account + profile exist; never fall back to Firebase verification email
      console.error("[auth] Resend verification failed after signup", send.error);
      throw new Error(
        send.error ||
          "Account created, but Resend verification email failed. Open the dashboard and tap Resend.",
      );
    }
    console.info("[auth] Resend verification email sent for", cred.user.email, send.message);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    const cred = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password,
    );
    await cred.user.reload();
    const token = await cred.user.getIdToken(true);
    await fetch("/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: cred.user.displayName ?? "" }),
    });
  }, []);

  /** Google Sign-In — verified by Google; no Resend verification email */
  const loginWithGoogle = useCallback(async () => {
    const auth = getClientAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    await cred.user.reload();
    const token = await cred.user.getIdToken(true);
    await fetch("/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: cred.user.displayName ?? "" }),
    });
    // Do NOT call send-verification for Google (emailVerified from provider)
  }, []);

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
    setProfile(null);
    setStaff(null);
  }, []);

  const resendVerification = useCallback(async () => {
    const auth = getClientAuth();
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in");
    await current.reload();
    if (current.emailVerified) throw new Error("Email is already verified");

    const elapsed = Date.now() - lastResendAt.current;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Resend available in ${wait} seconds`);
    }

    const token = await current.getIdToken(true);
    const send = await callSendVerification(token, current.displayName ?? "");
    if (!send.ok) {
      if (send.cooldownSeconds) {
        throw new Error(`Resend available in ${send.cooldownSeconds} seconds`);
      }
      throw new Error(send.error || "Could not resend verification email");
    }
    lastResendAt.current = Date.now();
    try {
      sessionStorage.setItem("ir_verify_resend_at", String(lastResendAt.current));
    } catch {
      /* ignore */
    }
    console.info("[auth] Resend verification email resent to", current.email);
  }, []);

  const refreshVerification = useCallback(async () => {
    const auth = getClientAuth();
    const current = auth.currentUser;
    if (!current) return false;
    await current.reload();
    await current.getIdToken(true);
    setUser(auth.currentUser);
    const profileResult = await (async () => {
      const token = await auth.currentUser!.getIdToken(true);
      const res = await fetch("/api/auth/ensure-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: auth.currentUser?.displayName ?? "" }),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile as UserProfile);
        return data.profile as UserProfile;
      }
      return null;
    })();
    console.info("[auth] refreshVerification", {
      emailVerified: auth.currentUser?.emailVerified,
      indId: profileResult?.indId ?? null,
    });
    return Boolean(auth.currentUser?.emailVerified);
  }, []);

  useEffect(() => {
    if (!user || user.emailVerified) return;
    let last = 0;
    const onFocus = () => {
      const now = Date.now();
      if (now - last < 15_000) return;
      last = now;
      void refreshVerification();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refreshVerification]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1" || !user.emailVerified) {
      void refreshVerification();
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetPassword = useCallback(async (email: string) => {
    try {
      // Password reset stays Firebase-managed (not email verification)
      await sendPasswordResetEmail(
        getClientAuth(),
        email,
        passwordResetActionCodeSettings("/login?reset=1"),
      );
      console.info("[auth] password reset email requested for", email);
    } catch (err) {
      console.error("[auth] password reset error", err);
      throw err;
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user?.email) throw new Error("Not signed in");
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
    },
    [user],
  );

  const emailVerified = Boolean(user?.emailVerified || profile?.emailVerified);

  const value = useMemo(
    () => ({
      configured,
      user,
      profile,
      staff,
      loading,
      emailVerified,
      getIdToken,
      ensureProfile,
      signup,
      login,
      loginWithGoogle,
      logout,
      resendVerification,
      refreshVerification,
      resetPassword,
      changePassword,
    }),
    [
      configured,
      user,
      profile,
      staff,
      loading,
      emailVerified,
      getIdToken,
      ensureProfile,
      signup,
      login,
      loginWithGoogle,
      logout,
      resendVerification,
      refreshVerification,
      resetPassword,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
