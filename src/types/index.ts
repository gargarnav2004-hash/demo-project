export const CATEGORIES = [
  "Product Sense",
  "Metrics",
  "Root Cause Analysis",
  "Estimation",
  "Strategy",
  "Behavioural",
  "AI PM",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const MAX_ANSWER_LENGTH = 5000;

export interface Question {
  id: string;
  category: Category;
  prompt: string;
  difficulty: Difficulty;
}

export interface FeedbackResult {
  score: number;
  bullets: string[];
  // Null if saving the attempt failed; the feedback is still shown.
  attemptId: string | null;
}

export type FeedbackRating = "up" | "down";

export interface AttemptSummary {
  id: string;
  questionText: string;
  category: Category;
  difficulty: Difficulty;
  score: number;
  createdAt: string;
}

export interface Attempt extends AttemptSummary {
  answer: string;
  bullets: string[];
}

export interface Rubric {
  category: Category;
  criteria: string;
}
