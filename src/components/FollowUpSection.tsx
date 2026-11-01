import { useState } from "react";
import { questionProps, track } from "@/lib/analytics";
import { MAX_ANSWER_LENGTH, type FollowUpResult, type Question } from "@/types";
import FeedbackRatingButtons from "./FeedbackRatingButtons";
import RubricBreakdown from "./RubricBreakdown";

interface FollowUpSectionProps {
  attemptId: string;
  question: Question;
  followUpQuestion: string;
}

export default function FollowUpSection({ attemptId, question, followUpQuestion }: FollowUpSectionProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<FollowUpResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    setLimitMessage(null);
    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "daily_limit" || data.code === "app_limit") {
          setLimitMessage(data.error);
          return;
        }
        throw new Error(data.error ?? "Failed to score your follow-up");
      }
      const data: FollowUpResult = await res.json();
      setResult(data);
      track("followup_answered", {
        ...questionProps(question),
        attempt_id: attemptId,
        answer_length: answer.length,
        score: data.score,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-primary/5 p-5">
      <h3 className="text-sm font-medium text-primary">The interviewer follows up</h3>
      <p className="mt-2 font-medium leading-relaxed">{followUpQuestion}</p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!!result}
        rows={5}
        maxLength={MAX_ANSWER_LENGTH}
        placeholder="Type your answer here…"
        aria-label="Your answer to the follow-up"
        className="mt-3 w-full resize-none rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed outline-none focus:border-primary disabled:opacity-60"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {limitMessage && (
        <p className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed">
          {limitMessage}
        </p>
      )}

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Scoring…" : "Submit follow-up"}
        </button>
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <RubricBreakdown score={result.score} rubric={result.rubric} bullets={result.bullets} />
          <FeedbackRatingButtons attemptId={attemptId} question={question} target="followup" />
        </div>
      )}
    </div>
  );
}
