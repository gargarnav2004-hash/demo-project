import { RUBRIC_DIMENSIONS, type RubricResult } from "@/types";
import ScoreRow from "./ScoreRow";

interface RubricBreakdownProps {
  score: number;
  rubric: RubricResult | null;
  bullets: string[];
}

// Answers saved before the rubric existed have a score and bullets only.
export default function RubricBreakdown({ score, rubric, bullets }: RubricBreakdownProps) {
  return (
    <>
      <ScoreRow score={score} label="Overall" />

      {rubric && (
        <dl className="mt-5 space-y-4 border-t border-border pt-5">
          {RUBRIC_DIMENSIONS.map(({ key, label }) => (
            <div key={key}>
              <dt className="flex items-center justify-between gap-3 text-sm font-medium">
                <span>{label}</span>
                <span className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${i < rubric[key].score ? "bg-primary" : "bg-border"}`}
                      />
                    ))}
                  </span>
                  <span>{rubric[key].score} / 5</span>
                </span>
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{rubric[key].comment}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={rubric ? "mt-5 border-t border-border pt-5" : "mt-4"}>
        {rubric && <h3 className="text-sm font-medium">How to improve</h3>}
        <ul className={`space-y-2 ${rubric ? "mt-2" : ""}`}>
          {bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
