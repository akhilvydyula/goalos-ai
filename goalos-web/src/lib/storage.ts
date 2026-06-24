import type { UserState } from "./types";
import { generateDemoApps } from "./demo-data";

const STORAGE_KEY = "goalos-user-state";

export const defaultState = (): UserState => ({
  onboarded: false,
  privacyAccepted: false,
  apps: generateDemoApps(),
  intentCheckIns: [],
  focusSprints: [],
  roadmapProgress: 35,
  energyToday: 3,
  moodToday: 3,
  weeklyHistory: [68, 72, 75, 71, 78, 74, 72],
  createdAt: new Date().toISOString(),
});

export function loadState(): UserState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state: UserState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportState(state: UserState): string {
  return JSON.stringify(state, null, 2);
}
