import { useState } from "react";
import { track } from "@/lib/analytics";
import type { FeedbackRating, Question } from "@/types";

interface FeedbackRatingButtonsProps {
  attemptId: string;
  question: Question;
}

const OPTIONS: { rating: FeedbackRating; label: string }[] = [
  { rating: "up", label: "Helpful" },
  { rating: "down", label: "Not helpful" },
];

export default function FeedbackRatingButtons({ attemptId, question }: FeedbackRatingButtonsProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRate(next: FeedbackRating) {
    if (saving || next === rating) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, rating: next }),
      });
      if (!res.ok) throw new Error("Failed to save your rating");
      setRating(next);
      track("feedback_rated", {
        category: question.category,
        question_id: question.id,
        difficulty: question.difficulty,
        rating: next,
        attempt_id: attemptId,
      });
    } catch {
      setError("Couldn't save your rating. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Was this feedback helpful?</span>
        <div className="flex gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.rating}
              onClick={() => handleRate(option.rating)}
              disabled={saving}
              aria-label={option.label}
              aria-pressed={rating === option.rating}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
                rating === option.rating
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted hover:border-primary hover:text-foreground"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 ${option.rating === "down" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 10v11" />
                <path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
