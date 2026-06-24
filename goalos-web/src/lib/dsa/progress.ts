import type { DsaProgress, DsaProblem } from "./types";
import { DSA_PROBLEMS } from "./problem-bank";

const STORAGE_KEY = "goalos-dsa-progress";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadDsaProgress(): DsaProgress {
  if (typeof window === "undefined") {
    return { solvedIds: [], reviewIds: [], lastSolvedAt: {}, streakDays: 0, lastPracticeDate: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { solvedIds: [], reviewIds: [], lastSolvedAt: {}, streakDays: 0, lastPracticeDate: null };
    return JSON.parse(raw) as DsaProgress;
  } catch {
    return { solvedIds: [], reviewIds: [], lastSolvedAt: {}, streakDays: 0, lastPracticeDate: null };
  }
}

export function saveDsaProgress(progress: DsaProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markProblemSolved(progress: DsaProgress, problemId: string): DsaProgress {
  const today = todayKey();
  const solvedIds = progress.solvedIds.includes(problemId)
    ? progress.solvedIds
    : [...progress.solvedIds, problemId];
  const reviewIds = progress.reviewIds.filter((id) => id !== problemId);

  let streakDays = progress.streakDays;
  if (progress.lastPracticeDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    streakDays =
      progress.lastPracticeDate === yesterdayKey ? progress.streakDays + 1 : 1;
  }

  return {
    solvedIds,
    reviewIds,
    lastSolvedAt: { ...progress.lastSolvedAt, [problemId]: new Date().toISOString() },
    streakDays,
    lastPracticeDate: today,
  };
}

export function toggleReview(progress: DsaProgress, problemId: string): DsaProgress {
  const inReview = progress.reviewIds.includes(problemId);
  return {
    ...progress,
    reviewIds: inReview
      ? progress.reviewIds.filter((id) => id !== problemId)
      : [...progress.reviewIds, problemId],
  };
}

export function patternMastery(progress: DsaProgress, patternId: string) {
  const total = DSA_PROBLEMS.filter((p) => p.pattern === patternId).length;
  const done = DSA_PROBLEMS.filter(
    (p) => p.pattern === patternId && progress.solvedIds.includes(p.id)
  ).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function pickDailyProblem(progress: DsaProgress, week: number): DsaProblem {
  const weekProblems = DSA_PROBLEMS.filter((p) => p.week === week);
  const unsolved = weekProblems.filter((p) => !progress.solvedIds.includes(p.id));
  const pool = unsolved.length > 0 ? unsolved : weekProblems;

  if (progress.reviewIds.length > 0) {
    const review = pool.find((p) => progress.reviewIds.includes(p.id));
    if (review) return review;
  }

  const dayIndex = new Date().getDate();
  return pool[dayIndex % pool.length] ?? DSA_PROBLEMS[0];
}

export function weakPatterns(progress: DsaProgress, limit = 3) {
  return [...new Set(DSA_PROBLEMS.map((p) => p.pattern))]
    .map((pattern) => ({ pattern, ...patternMastery(progress, pattern) }))
    .filter((p) => p.total > 0 && p.pct < 100)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit);
}

export function leetcodeUrl(slug?: string) {
  if (!slug) return null;
  return `https://leetcode.com/problems/${slug}/`;
}
