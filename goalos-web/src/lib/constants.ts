import type { GoalTemplate, ProductivityIdentity } from "./types";

export const GOAL_TEMPLATES: {
  id: GoalTemplate;
  title: string;
  description: string;
}[] = [
  {
    id: "data-engineering-job",
    title: "Get Data Engineering Job",
    description: "Build SQL, PySpark, and portfolio skills for your next role.",
  },
  {
    id: "software-interview",
    title: "Crack Software Engineering Interview",
    description: "DSA, system design, and mock interview prep.",
  },
  {
    id: "learn-ai-de",
    title: "Learn AI / Data Engineering",
    description: "Structured learning path for modern data & AI skills.",
  },
  {
    id: "reduce-social-media",
    title: "Reduce Social Media Distraction",
    description: "Reclaim focus from passive scrolling.",
  },
  {
    id: "founder-mode",
    title: "Build Startup / Founder Mode",
    description: "Convert consumption into shipping and execution.",
  },
];

export const DNA_QUESTIONS = [
  {
    id: "distractionTime",
    question: "When do you get distracted most?",
    options: ["Morning", "Afternoon", "Evening", "Late night"],
  },
  {
    id: "distractingApps",
    question: "Which apps distract you most?",
    multi: true,
    options: ["YouTube", "Instagram", "TikTok", "LinkedIn", "Reddit", "Twitter/X"],
  },
  {
    id: "distractionTrigger",
    question: "What is your main distraction trigger?",
    options: ["Boredom", "Stress", "Notifications", "Habit", "Procrastination"],
  },
  {
    id: "bestFocusTime",
    question: "What time do you focus best?",
    options: ["Early morning (5–9am)", "Morning (9–12pm)", "Afternoon", "Evening", "Late night"],
  },
  {
    id: "energyLevel",
    question: "What is your energy level today?",
    scale: true,
    min: 1,
    max: 5,
  },
  {
    id: "coachingTone",
    question: "What coaching tone do you prefer?",
    options: ["Supportive", "Direct", "Motivational", "Calm & analytical"],
  },
  {
    id: "goalBlocker",
    question: "What is your biggest goal blocker?",
    options: [
      "Too much content, not enough action",
      "Night scrolling",
      "Context switching",
      "Low energy",
      "Unclear next step",
    ],
  },
] as const;

export const INTENT_OPTIONS = [
  { id: "learning", label: "Learning", aligned: true },
  { id: "work", label: "Work", aligned: true },
  { id: "interview-prep", label: "Interview preparation", aligned: true },
  { id: "business-research", label: "Business research", aligned: true },
  { id: "messaging", label: "Messaging", aligned: true },
  { id: "entertainment", label: "Entertainment", aligned: false },
  { id: "stress-relief", label: "Stress relief", aligned: false },
  { id: "boredom", label: "Boredom", aligned: false },
  { id: "no-reason", label: "No reason", aligned: false },
] as const;

export const DEFAULT_APPS = [
  { name: "Udemy", packageName: "com.udemy.android", classification: "goal-supporting" as const },
  { name: "ChatGPT", packageName: "com.openai.chatgpt", classification: "mixed" as const },
  { name: "YouTube", packageName: "com.google.android.youtube", classification: "mixed" as const },
  { name: "Instagram", packageName: "com.instagram.android", classification: "distracting" as const },
  { name: "LinkedIn", packageName: "com.linkedin.android", classification: "mixed" as const },
  { name: "LeetCode", packageName: "com.leetcode.android", classification: "goal-supporting" as const },
  { name: "Notion", packageName: "notion.id", classification: "goal-supporting" as const },
  { name: "Chrome", packageName: "com.android.chrome", classification: "neutral" as const },
  { name: "WhatsApp", packageName: "com.whatsapp", classification: "neutral" as const },
  { name: "TikTok", packageName: "com.zhiliaoapp.musically", classification: "distracting" as const },
];

export const IDENTITY_DESCRIPTIONS: Record<ProductivityIdentity, string> = {
  "Consistent Builder": "Good daily execution — time to level up the challenge.",
  "High Potential, Low Execution": "You consume learning content but need more action sprints.",
  "Night Scroller": "Late-night patterns are reducing your morning focus.",
  "Focused Creator": "Strong output orientation — protect your deep work windows.",
  "Career Climber": "Steady progress toward your career goal.",
  "Deep Worker": "Excellent sustained focus sessions this week.",
  "AI Learner": "Building modern AI & data skills consistently.",
  "Passive Consumer": "More consumption than creation — one sprint can flip this.",
  "Dopamine Drifter": "Frequent context switching — try shorter focus blocks.",
};

export const PRIVACY_PROMISE =
  "We do not read your messages, typed text, photos, calls, or private app content. We only analyze approved usage patterns to help you reach your goals.";

export const TAGLINE = "Turn screen time into goal time.";
