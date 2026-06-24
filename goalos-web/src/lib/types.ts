export type GoalTemplate =
  | "data-engineering-job"
  | "software-interview"
  | "learn-ai-de"
  | "reduce-social-media"
  | "founder-mode";

export type AppClassification =
  | "goal-supporting"
  | "mixed"
  | "neutral"
  | "distracting";

export type ProductivityIdentity =
  | "Consistent Builder"
  | "High Potential, Low Execution"
  | "Night Scroller"
  | "Focused Creator"
  | "Career Climber"
  | "Deep Worker"
  | "AI Learner"
  | "Passive Consumer"
  | "Dopamine Drifter";

export type IntentReason =
  | "learning"
  | "work"
  | "interview-prep"
  | "business-research"
  | "messaging"
  | "entertainment"
  | "stress-relief"
  | "boredom"
  | "no-reason";

export type TabId = "today" | "goal" | "coach" | "insights" | "you";

export interface UserGoal {
  template: GoalTemplate;
  title: string;
  timelineWeeks: number;
  dailyCommitmentMinutes: number;
  focusWindow: string;
  painPoint: string;
  motivation: string;
}

export interface DnaAnswers {
  distractionTime: string;
  distractingApps: string[];
  distractionTrigger: string;
  bestFocusTime: string;
  energyLevel: number;
  coachingTone: string;
  goalBlocker: string;
}

export interface ProductivityProfile {
  identity: ProductivityIdentity;
  distractionTrigger: string;
  focusWindow: string;
  coachingTone: string;
  reminderStrategy: string;
}

export interface TrackedApp {
  id: string;
  name: string;
  packageName: string;
  classification: AppClassification;
  minutesToday: number;
  sessions: number;
  lastOpenedHour: number;
}

export interface IntentCheckIn {
  appId: string;
  reason: IntentReason;
  timestamp: string;
  aligned: boolean;
}

export interface FocusSprint {
  id: string;
  title: string;
  durationMinutes: number;
  startedAt?: string;
  completedAt?: string;
  scoreBoost: number;
}

export interface ScoreBreakdown {
  goalSupportingTime: number;
  roadmapCompletion: number;
  deepWork: number;
  intentMatch: number;
  wellnessBalance: number;
  distractionPenalty: number;
  lateNightPenalty: number;
  contextSwitchPenalty: number;
  total: number;
}

export interface CoachRecommendation {
  diagnosis: string;
  nextAction: string;
  reminder: string;
  tomorrowPlan: string;
  scoreContext: number;
}

export type CoachRole = "coach" | "user";

export interface CoachMessage {
  id: string;
  role: CoachRole;
  text: string;
  timestamp: string;
}

export interface WeeklyReport {
  weekLabel: string;
  averageScore: number;
  productiveMinutes: number;
  distractedMinutes: number;
  bestFocusWindow: string;
  riskWindow: string;
  identity: ProductivityIdentity;
  nextWeekGoal: string;
  distractionReductionPercent: number;
}

export interface UserState {
  onboarded: boolean;
  privacyAccepted: boolean;
  goal?: UserGoal;
  dna?: DnaAnswers;
  profile?: ProductivityProfile;
  apps: TrackedApp[];
  intentCheckIns: IntentCheckIn[];
  focusSprints: FocusSprint[];
  roadmapProgress: number;
  energyToday: number;
  moodToday: number;
  weeklyHistory: number[];
  createdAt: string;
}
