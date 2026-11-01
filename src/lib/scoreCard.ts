import { formatScore } from "@/lib/rubric";
import type { Category } from "@/types";

// The overall score is out of 5, and a share card reads better out of 10.
export function scoreOutOfTen(score: number): string {
  return formatScore(Math.round(score * 20) / 10);
}

export function questionLabel(company: string | null, category: Category): string {
  const categoryName = category === "AI PM" ? category : category.toLowerCase();
  const name = company ? `${company} ${categoryName}` : categoryName;
  const article = /^[aeiou]/i.test(name) ? "an" : "a";
  return `${article} ${name} question`;
}

export function shareHeadline(score: number, company: string | null, category: Category): string {
  return `I scored ${scoreOutOfTen(score)}/10 on ${questionLabel(company, category)}`;
}
