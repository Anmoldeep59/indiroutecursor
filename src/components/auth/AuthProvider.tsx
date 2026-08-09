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
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  getClientAuth,
  getClientDb,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { emailActionCodeSettings } from "@/lib/auth/actionCode";
import { authErrorMessage } from "@/lib/auth/errors";
import type { StaffProfile, UserProfile } from "@/lib/types";

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
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const RESEND_COOLDOWN_MS = 60_000;

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
    const unsubStaff = onSnapshot(doc(db, COLLECTIONS.staff, user.uid), (snap) => {
      setStaff(snap.exists() ? (snap.data() as StaffProfile) : null);
    });
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
    try {
      await sendEmailVerification(cred.user, emailActionCodeSettings());
      lastResendAt.current = Date.now();
      try {
        sessionStorage.setItem("ir_verify_resend_at", String(lastResendAt.current));
      } catch {
        /* ignore */
      }
      console.info("[auth] verification email sent to", cred.user.email);
    } catch (err) {
      console.error("[auth] sendEmailVerification failed", err);
      throw new Error(authErrorMessage(err, "Could not send verification email"));
    }
    const token = await cred.user.getIdToken();
    const res = await fetch("/api/auth/ensure-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[auth] ensure-profile after signup failed", data);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
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

  const logout = useCallback(async () => {
    await signOut(getClientAuth());
    setProfile(null);
    setStaff(null);
  }, []);

  const resendVerification = useCallback(async () => {
    const auth = getClientAuth();
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in");
    if (current.emailVerified) throw new Error("Email is already verified");
    const elapsed = Date.now() - lastResendAt.current;
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Resend available in ${wait} seconds`);
    }
    try {
      await sendEmailVerification(current, emailActionCodeSettings());
      lastResendAt.current = Date.now();
      try {
        sessionStorage.setItem("ir_verify_resend_at", String(lastResendAt.current));
      } catch {
        /* ignore */
      }
      console.info("[auth] resend verification to", current.email);
    } catch (err) {
      console.error("[auth] resend verification failed", err);
      throw new Error(authErrorMessage(err, "Could not resend verification email"));
    }
  }, []);

  const refreshVerification = useCallback(async () => {
    const auth = getClientAuth();
    const current = auth.currentUser;
    if (!current) return false;
    await current.reload();
    // Force token refresh so Admin SDK sees email_verified
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

  // Refresh verification on tab focus / visibility (throttled)
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

  // On login / dashboard mount when verified flag in URL
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
      await sendPasswordResetEmail(
        getClientAuth(),
        email,
        emailActionCodeSettings("/login?reset=1"),
      );
      console.info("[auth] password reset email requested for", email);
    } catch (err) {
      // Still succeed generically to caller — log real error for debug
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
