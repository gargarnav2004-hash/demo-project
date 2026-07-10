import type { FeedbackResult } from "@/types";

interface FeedbackPanelProps {
  feedback: FeedbackResult;
  onNext: () => void;
  onChangeCategory: () => void;
}

export default function FeedbackPanel({ feedback, onNext, onChangeCategory }: FeedbackPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted">Score</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                i < feedback.score ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{feedback.score} / 5</span>
      </div>

      <ul className="mt-4 space-y-2">
        {feedback.bullets.map((bullet, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onNext}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Next question
        </button>
        <button
          onClick={onChangeCategory}
          className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:border-primary"
        >
          Change category
        </button>
      </div>
    </div>
  );
}
