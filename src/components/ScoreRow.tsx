export default function ScoreRow({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted">Score</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < score ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{score} / 5</span>
    </div>
  );
}
