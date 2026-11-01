import posthog from "posthog-js";
import type { Category, Difficulty, FeedbackRating, Question, RatingTarget } from "@/types";

export type ShareChannel = "linkedin" | "whatsapp" | "download";

interface QuestionProps {
  category: Category;
  question_id: string;
  difficulty: Difficulty;
  company: string | null;
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
  score_card_shared: QuestionProps & { attempt_id: string; channel: ShareChannel; score: number };
}

export function questionProps(question: Question): QuestionProps {
  return {
    category: question.category,
    question_id: question.id,
    difficulty: question.difficulty,
    company: question.company,
  };
}

export function track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, props);
}
