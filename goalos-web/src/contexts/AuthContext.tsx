"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { goalosApi, type AuthSession, type MemberRole } from "@/lib/api/goalos-api";
import { buildDemoSession } from "@/lib/api/demo-session";
import { findDemoAccount } from "@/lib/demo-credentials";
import { clearSession, loadSession, saveSession } from "@/lib/auth/session";

type AuthContextValue = {
  session: AuthSession | null;
  loading: boolean;
  apiEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    displayName?: string;
    orgName?: string;
  }) => Promise<void>;
  logout: () => void;
  role: MemberRole | null;
  canAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only session hydration
    setSession(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const demoAccount = findDemoAccount(email, password);

    if (goalosApi.enabled()) {
      try {
        const next = await goalosApi.login(email, password);
        saveSession(next);
        setSession(next);
        return;
      } catch (err) {
        if (!demoAccount) {
          throw err instanceof Error ? err : new Error("Sign in failed");
        }
      }
    }

    if (demoAccount) {
      const next = buildDemoSession(demoAccount);
      saveSession(next);
      setSession(next);
      return;
    }

    throw new Error(
      goalosApi.enabled()
        ? "Invalid email or password"
        : "Use demo credentials below or start the API with npm run saas:dev"
    );
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; displayName?: string; orgName?: string }) => {
      if (goalosApi.enabled()) {
        const next = await goalosApi.register(input);
        saveSession(next);
        setSession(next);
        return;
      }
      throw new Error("Registration requires the API. Use demo sign-in or run npm run saas:dev.");
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const role = session?.organization.role ?? null;
  const canAdmin = role === "OWNER" || role === "ADMIN";

  const value = useMemo(
    () => ({
      session,
      loading,
      apiEnabled: goalosApi.enabled(),
      login,
      register,
      logout,
      role,
      canAdmin,
    }),
    [session, loading, login, register, logout, role, canAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
