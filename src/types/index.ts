export const CATEGORIES = [
  "Product Sense",
  "Metrics",
  "Estimation",
  "Strategy",
  "Behavioural",
  "AI PM",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Question {
  id: string;
  category: Category;
  prompt: string;
}

export interface FeedbackResult {
  score: number;
  bullets: string[];
}
