import { DEFAULT_APPS } from "./constants";
import type { TrackedApp } from "./types";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDemoApps(): TrackedApp[] {
  return DEFAULT_APPS.map((app, i) => {
    const isDistracting = app.classification === "distracting";
    const isSupporting = app.classification === "goal-supporting";
    const minutesToday = isDistracting
      ? randomBetween(25, 90)
      : isSupporting
        ? randomBetween(30, 120)
        : randomBetween(10, 60);

    return {
      id: `app-${i}`,
      name: app.name,
      packageName: app.packageName,
      classification: app.classification,
      minutesToday,
      sessions: randomBetween(2, isDistracting ? 15 : 8),
      lastOpenedHour: isDistracting ? randomBetween(20, 23) : randomBetween(8, 18),
    };
  });
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatHour(hour: number): string {
  const h = hour % 24;
  const period = h >= 12 ? "pm" : "am";
  const display = h % 12 || 12;
  return `${display}${period}`;
}
