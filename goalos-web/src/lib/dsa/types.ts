export type DsaDifficulty = "Easy" | "Medium" | "Hard";

export type DsaPatternId =
  | "arrays-hashing"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "binary-search"
  | "linked-list"
  | "trees"
  | "graphs"
  | "heap"
  | "backtracking"
  | "dynamic-programming"
  | "intervals";

export type DsaProblem = {
  id: string;
  title: string;
  pattern: DsaPatternId;
  difficulty: DsaDifficulty;
  week: number;
  timeMinutes: number;
  summary: string;
  constraints: string[];
  hints: string[];
  approach: string[];
  complexity: { time: string; space: string };
  leetcodeSlug?: string;
  companies: string[];
};

export type DsaPattern = {
  id: DsaPatternId;
  name: string;
  description: string;
  week: number;
  icon: string;
};

export type DsaProgress = {
  solvedIds: string[];
  reviewIds: string[];
  lastSolvedAt: Record<string, string>;
  streakDays: number;
  lastPracticeDate: string | null;
};

export const EMPTY_DSA_PROGRESS: DsaProgress = {
  solvedIds: [],
  reviewIds: [],
  lastSolvedAt: {},
  streakDays: 0,
  lastPracticeDate: null,
};
