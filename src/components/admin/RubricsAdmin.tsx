"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type Category, type Rubric } from "@/types";
import { useToast } from "@/components/admin/ToastProvider";

export default function RubricsAdmin() {
  const showToast = useToast();
  const [rubrics, setRubrics] = useState<Record<Category, string>>(
    {} as Record<Category, string>,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<Category | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/rubrics");
        if (!res.ok) throw new Error("Failed to load rubrics");
        const data: { rubrics: Rubric[] } = await res.json();
        const map = {} as Record<Category, string>;
        for (const category of CATEGORIES) map[category] = "";
        for (const rubric of data.rubrics) map[rubric.category] = rubric.criteria;
        if (!ignore) setRubrics(map);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSave(category: Category) {
    const criteria = rubrics[category]?.trim();
    if (!criteria) return;
    setSavingCategory(category);
    try {
      const res = await fetch(`/api/admin/rubrics/${encodeURIComponent(category)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save rubric");
      }
      showToast("success", `${category} rubric saved`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingCategory(null);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading rubrics…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => (
        <div key={category} className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">{category}</h2>
          <textarea
            value={rubrics[category] ?? ""}
            onChange={(e) => setRubrics((prev) => ({ ...prev, [category]: e.target.value }))}
            rows={3}
            placeholder="Grading criteria for this category…"
            className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
          />
          <div className="mt-3">
            <button
              onClick={() => handleSave(category)}
              disabled={!rubrics[category]?.trim() || savingCategory === category}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingCategory === category ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
