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
  // Null for general questions that aren't themed around a company.
  company: string | null;
}

export interface CompanyOption {
  name: string;
  categories: Category[];
}

export const RUBRIC_DIMENSIONS = [
  { key: "structure", label: "Structure" },
  { key: "user_focus", label: "User focus" },
  { key: "metrics", label: "Metrics" },
  { key: "tradeoffs", label: "Trade-offs" },
  { key: "communication", label: "Communication" },
] as const;

export type RubricDimension = (typeof RUBRIC_DIMENSIONS)[number]["key"];

export type RubricResult = Record<RubricDimension, { score: number; comment: string }>;

export interface FollowUpResult {
  score: number;
  rubric: RubricResult;
  bullets: string[];
}

export interface FeedbackResult extends FollowUpResult {
  followUpQuestion: string;
  // Null if saving the attempt failed; the feedback is still shown.
  attemptId: string | null;
}

export type FeedbackRating = "up" | "down";

export type RatingTarget = "answer" | "followup";

export interface AttemptSummary {
  id: string;
  questionText: string;
  category: Category;
  difficulty: Difficulty;
  company: string | null;
  score: number;
  createdAt: string;
}

export interface Attempt extends AttemptSummary {
  answer: string;
  bullets: string[];
  rubric: RubricResult | null;
  followUpQuestion: string | null;
  followUp: (FollowUpResult & { answer: string }) | null;
}

export interface EvalItem {
  attemptId: string;
  category: Category;
  questionText: string;
  answer: string;
  aiScores: Record<RubricDimension, number>;
  humanScores: Record<RubricDimension, number> | null;
}

export interface EvalStats {
  graded: number;
  exactRate: number | null;
  withinOneRate: number | null;
  // Average of AI minus human, so a positive value means the AI scores higher.
  averageDifference: number | null;
  dimensions: {
    key: RubricDimension;
    label: string;
    exactRate: number | null;
    withinOneRate: number | null;
  }[];
}

export interface Rubric {
  category: Category;
  criteria: string;
}
