import type { AuthSession } from "@/lib/api/goalos-api";

const SESSION_KEY = "goalos-enterprise-session";

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function updateAccessToken(accessToken: string): AuthSession | null {
  const session = loadSession();
  if (!session) return null;
  const next = { ...session, accessToken };
  saveSession(next);
  return next;
}
