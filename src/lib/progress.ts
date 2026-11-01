import { CATEGORIES, type AttemptSummary, type Category } from "@/types";

const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86_400_000;
const TREND_DAYS = 30;

export interface CategoryAverage {
  category: Category;
  average: number | null;
  count: number;
}

export interface TrendPoint {
  day: string;
  label: string;
  average: number;
  count: number;
}

export interface Progress {
  categories: CategoryAverage[];
  trend: TrendPoint[];
  streak: number;
  practicedToday: boolean;
}

// Days are IST calendar dates as YYYY-MM-DD, matching the daily limit's reset.
function toDay(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

function previousDay(day: string): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

function average(scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function computeProgress(attempts: AttemptSummary[], now = new Date()): Progress {
  const categories = CATEGORIES.map((category) => {
    const scores = attempts.filter((a) => a.category === category).map((a) => a.score);
    return { category, average: scores.length ? average(scores) : null, count: scores.length };
  });

  const scoresByDay = new Map<string, number[]>();
  for (const attempt of attempts) {
    const day = toDay(new Date(attempt.createdAt));
    scoresByDay.set(day, [...(scoresByDay.get(day) ?? []), attempt.score]);
  }

  const trend = [...scoresByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-TREND_DAYS)
    .map(([day, scores]) => ({
      day,
      label: new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      average: average(scores),
      count: scores.length,
    }));

  // A streak stays alive until a full day is missed, so it doesn't read as zero
  // in the morning before today's practice.
  const today = toDay(now);
  const practicedToday = scoresByDay.has(today);
  let day = practicedToday ? today : previousDay(today);
  let streak = 0;
  while (scoresByDay.has(day)) {
    streak += 1;
    day = previousDay(day);
  }

  return { categories, trend, streak, practicedToday };
}
