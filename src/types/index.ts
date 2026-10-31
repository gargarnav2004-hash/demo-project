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

export const MAX_ANSWER_LENGTH = 5000;
export const MAX_QUESTION_LENGTH = 1000;

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
