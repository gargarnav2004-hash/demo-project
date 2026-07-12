export const CATEGORIES = [
  "Product Sense",
  "Metrics",
  "Estimation",
  "Strategy",
  "Behavioural",
  "AI PM",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Question {
  id: string;
  category: Category;
  prompt: string;
  difficulty: Difficulty;
}

export interface FeedbackResult {
  score: number;
  bullets: string[];
}

export interface Rubric {
  category: Category;
  criteria: string;
}
