import { formatScore } from "@/lib/rubric";

interface ScoreRowProps {
  score: number;
  label?: string;
}

export default function ScoreRow({ score, label = "Score" }: ScoreRowProps) {
  const filled = Math.round(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < filled ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{formatScore(score)} / 5</span>
    </div>
  );
}
