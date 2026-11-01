import type { FeedbackResult, Question } from "@/types";
import FeedbackLink from "./FeedbackLink";
import FeedbackRatingButtons from "./FeedbackRatingButtons";
import FollowUpSection from "./FollowUpSection";
import RubricBreakdown from "./RubricBreakdown";
import ShareScore from "./ShareScore";

interface FeedbackPanelProps {
  feedback: FeedbackResult;
  question: Question;
  onNext: () => void;
  onChangeCategory: () => void;
}

export default function FeedbackPanel({ feedback, question, onNext, onChangeCategory }: FeedbackPanelProps) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
      <RubricBreakdown score={feedback.score} rubric={feedback.rubric} bullets={feedback.bullets} />

      {feedback.attemptId && (
        <>
          <FeedbackRatingButtons attemptId={feedback.attemptId} question={question} target="answer" />
          <ShareScore attemptId={feedback.attemptId} score={feedback.score} question={question} />
          <FollowUpSection
            attemptId={feedback.attemptId}
            question={question}
            followUpQuestion={feedback.followUpQuestion}
          />
        </>
      )}

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

      <p className="mt-5 text-sm text-muted">
        This is an early beta. Did something feel off?{" "}
        <FeedbackLink className="font-medium text-primary underline" />
      </p>
    </div>
  );
}
