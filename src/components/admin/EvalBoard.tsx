"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { RUBRIC_DIMENSIONS, type EvalItem, type EvalStats, type RubricDimension } from "@/types";

interface EvalBoardProps {
  items: EvalItem[];
  initialStats: EvalStats;
}

function percent(rate: number | null): string {
  return rate === null ? "–" : `${Math.round(rate * 100)}%`;
}

function describeDifference(difference: number | null): string {
  if (difference === null) return "–";
  const size = Math.abs(difference).toFixed(2);
  if (Number(size) === 0) return "No difference";
  return `AI ${size} ${difference > 0 ? "higher" : "lower"}`;
}

function EvalCard({ item, onSaved }: { item: EvalItem; onSaved: (stats: EvalStats) => void }) {
  const showToast = useToast();
  const [scores, setScores] = useState<Partial<Record<RubricDimension, number>>>(item.humanScores ?? {});
  const [saved, setSaved] = useState(!!item.humanScores);
  const [saving, setSaving] = useState(false);
  const complete = RUBRIC_DIMENSIONS.every(({ key }) => scores[key]);

  async function handleSave() {
    if (!complete || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: item.attemptId, scores }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save your scores");
      }
      const data: { stats: EvalStats } = await res.json();
      setSaved(true);
      onSaved(data.stats);
      showToast("success", "Scores saved");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {item.category}
        </span>
        {saved && <span className="text-xs font-medium text-muted">Graded</span>}
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed">{item.questionText}</p>
      <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-background p-3 text-sm leading-relaxed">
        {item.answer}
      </p>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted">
            <th className="pb-2 font-medium">Dimension</th>
            <th className="pb-2 text-center font-medium">AI</th>
            <th className="pb-2 text-right font-medium">You</th>
          </tr>
        </thead>
        <tbody>
          {RUBRIC_DIMENSIONS.map(({ key, label }) => (
            <tr key={key} className="border-t border-border">
              <td className="py-1.5">{label}</td>
              <td className="py-1.5 text-center font-medium">{item.aiScores[key]}</td>
              <td className="py-1.5 text-right">
                <select
                  value={scores[key] ?? ""}
                  onChange={(e) => {
                    setScores({ ...scores, [key]: Number(e.target.value) });
                    setSaved(false);
                  }}
                  aria-label={`Your ${label} score`}
                  className="min-h-10 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                >
                  <option value="" disabled>
                    –
                  </option>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        disabled={!complete || saving || saved}
        className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save my scores"}
      </button>
    </article>
  );
}

export default function EvalBoard({ items, initialStats }: EvalBoardProps) {
  const [stats, setStats] = useState(initialStats);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">AI scoring check</h1>
      <p className="mt-1 text-sm text-muted">
        Grade answers yourself to see how closely the AI agrees. Authors are hidden.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Answers graded</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{stats.graded}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Exact match</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{percent(stats.exactRate)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Within 1 point</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{percent(stats.withinOneRate)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Average gap</p>
          <p className="mt-1 text-sm font-semibold leading-8">{describeDifference(stats.averageDifference)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="pb-2 font-medium">Dimension</th>
              <th className="pb-2 text-right font-medium">Exact</th>
              <th className="pb-2 text-right font-medium">Within 1</th>
            </tr>
          </thead>
          <tbody>
            {stats.dimensions.map((dimension) => (
              <tr key={dimension.key} className="border-t border-border">
                <td className="py-1.5">{dimension.label}</td>
                <td className="py-1.5 text-right">{percent(dimension.exactRate)}</td>
                <td className="py-1.5 text-right">{percent(dimension.withinOneRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted">No answers with rubric scores yet.</p>
        ) : (
          items.map((item) => <EvalCard key={item.attemptId} item={item} onSaved={setStats} />)
        )}
      </div>
    </div>
  );
}
