"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import type { StaffProfile, UserProfile } from "@/lib/types";

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  profile: UserProfile | null;
  staff: StaffProfile | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(configured);

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

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const auth = getClientAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      const token = await cred.user.getIdToken();
      await fetch("/api/auth/ensure-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: name }),
      });
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();
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
  }, []);

  const resendVerification = useCallback(async () => {
    if (!user) throw new Error("Not signed in");
    await sendEmailVerification(user);
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getClientAuth(), email);
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

  const value = useMemo(
    () => ({
      configured,
      user,
      profile,
      staff,
      loading,
      getIdToken,
      signup,
      login,
      logout,
      resendVerification,
      resetPassword,
      changePassword,
    }),
    [
      configured,
      user,
      profile,
      staff,
      loading,
      getIdToken,
      signup,
      login,
      logout,
      resendVerification,
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
