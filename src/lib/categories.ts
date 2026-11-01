import type { Category } from "@/types";

export const CATEGORY_LABELS: Partial<Record<Category, string>> = {
  Estimation: "Estimation (guesstimates)",
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  "Product Sense": "Design and improve products for real users.",
  Metrics: "Define, track, and reason about the right numbers.",
  "Root Cause Analysis": "Work out why a key number suddenly changed.",
  Estimation: "Break down ambiguous quantities with structure.",
  Strategy: "Make the call on markets, positioning, and tradeoffs.",
  Behavioural: "Tell clear, honest stories about your experience.",
  "AI PM": "Judgment for building and shipping AI features.",
};
