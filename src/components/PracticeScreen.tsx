import { useState } from "react";
import { track } from "@/lib/analytics";
import { MAX_ANSWER_LENGTH, type Category, type FeedbackResult, type Question } from "@/types";
import FeedbackPanel from "./FeedbackPanel";

interface PracticeScreenProps {
  category: Category;
  question: Question | null;
  loadingQuestion: boolean;
  error: string | null;
  onNextQuestion: () => void;
  onChangeCategory: () => void;
}

export default function PracticeScreen({
  category,
  question,
  loadingQuestion,
  error,
  onNextQuestion,
  onChangeCategory,
}: PracticeScreenProps) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!question || !answer.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setLimitMessage(null);
    const questionProps = {
      category: question.category,
      question_id: question.id,
      difficulty: question.difficulty,
    };
    track("answer_submitted", { ...questionProps, answer_length: answer.length });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.code === "daily_limit" || data.code === "app_limit") {
          setLimitMessage(data.error);
          return;
        }
        throw new Error(data.error ?? "Failed to get feedback");
      }
      const data: FeedbackResult = await res.json();
      setFeedback(data);
      track("feedback_viewed", { ...questionProps, score: data.score });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setAnswer("");
    setFeedback(null);
    setSubmitError(null);
    onNextQuestion();
  }

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {category}
          </span>
          {question && !error && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {question.difficulty}
            </span>
          )}
        </div>
        <button onClick={onChangeCategory} className="text-sm text-muted hover:text-foreground">
          Change category
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        {loadingQuestion ? (
          <p className="text-muted">Loading question…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : question ? (
          <p className="text-lg font-medium leading-relaxed">{question.prompt}</p>
        ) : (
          <p className="text-muted">Loading question…</p>
        )}
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!question || !!feedback}
        rows={8}
        maxLength={MAX_ANSWER_LENGTH}
        placeholder="Type your answer here…"
        className="mt-4 w-full resize-none rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed outline-none focus:border-primary disabled:opacity-60"
      />

      {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}

      {limitMessage && (
        <p className="mt-4 rounded-2xl border border-border bg-primary/5 p-4 text-sm leading-relaxed">
          {limitMessage}
        </p>
      )}

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={!question || !answer.trim() || submitting}
          className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Scoring…" : "Submit answer"}
        </button>
      )}

      {feedback && question && (
        <FeedbackPanel
          feedback={feedback}
          question={question}
          onNext={handleNext}
          onChangeCategory={onChangeCategory}
        />
      )}
    </section>
  );
}
