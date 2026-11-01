import posthog from "posthog-js";
import type { Category, Difficulty, FeedbackRating, RatingTarget } from "@/types";

interface QuestionProps {
  category: Category;
  question_id: string;
  difficulty: Difficulty;
}

interface AnalyticsEvents {
  signed_up: Record<string, never>;
  question_started: QuestionProps;
  answer_submitted: QuestionProps & { answer_length: number };
  feedback_viewed: QuestionProps & { score: number };
  feedback_rated: QuestionProps & {
    rating: FeedbackRating;
    attempt_id: string;
    target: RatingTarget;
  };
  followup_answered: QuestionProps & { attempt_id: string; answer_length: number; score: number };
}

export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, props);
}
