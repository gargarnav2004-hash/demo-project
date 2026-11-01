"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, DIFFICULTIES, type Category, type Difficulty, type Question } from "@/types";
import { useToast } from "@/components/admin/ToastProvider";

interface EditState {
  category: Category;
  prompt: string;
  difficulty: Difficulty;
  company: string;
}

const COMPANY_LIST_ID = "question-companies";

export default function QuestionsAdmin() {
  const showToast = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");

  const [newCategory, setNewCategory] = useState<Category>(CATEGORIES[0]);
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("Medium");
  const [newCompany, setNewCompany] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadQuestions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/questions");
        if (!res.ok) throw new Error("Failed to load questions");
        const data: { questions: Question[] } = await res.json();
        if (!ignore) setQuestions(data.questions);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadQuestions();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate() {
    if (!newPrompt.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          prompt: newPrompt.trim(),
          difficulty: newDifficulty,
          company: newCompany,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create question");
      }
      const data: { question: Question } = await res.json();
      setQuestions((prev) => [...prev, data.question]);
      setNewPrompt("");
      setNewCompany("");
      showToast("success", "Question added");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(question: Question) {
    setEditingId(question.id);
    setEditState({
      category: question.category,
      prompt: question.prompt,
      difficulty: question.difficulty,
      company: question.company ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit(id: string) {
    if (!editState || !editState.prompt.trim()) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update question");
      }
      const data: { question: Question } = await res.json();
      setQuestions((prev) => prev.map((q) => (q.id === id ? data.question : q)));
      setEditingId(null);
      setEditState(null);
      showToast("success", "Question updated");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this question? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete question");
      }
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast("success", "Question deleted");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  const visibleQuestions =
    categoryFilter === "All" ? questions : questions.filter((q) => q.category === categoryFilter);
  const companies = [...new Set(questions.flatMap((q) => (q.company ? [q.company] : [])))];

  return (
    <div>
      <datalist id={COMPANY_LIST_ID}>
        {companies.map((company) => (
          <option key={company} value={company} />
        ))}
      </datalist>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Add a question</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={newDifficulty}
            onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-32"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            list={COMPANY_LIST_ID}
            placeholder="Company (optional)"
            aria-label="Company"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:flex-1"
          />
        </div>
        <textarea
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Question text…"
          rows={2}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={handleCreate}
          disabled={!newPrompt.trim() || creating}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Adding…" : "Add question"}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          All questions {!loading && <span className="font-normal text-muted">({visibleQuestions.length})</span>}
        </h2>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Category | "All")}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <p className="text-sm text-muted">Loading questions…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : visibleQuestions.length === 0 ? (
          <p className="text-sm text-muted">No questions yet.</p>
        ) : (
          visibleQuestions.map((question) => {
            const isEditing = editingId === question.id;
            return (
              <div key={question.id} className="rounded-2xl border border-border bg-surface p-4">
                {isEditing && editState ? (
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={editState.category}
                        onChange={(e) =>
                          setEditState({ ...editState, category: e.target.value as Category })
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-48"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editState.difficulty}
                        onChange={(e) =>
                          setEditState({ ...editState, difficulty: e.target.value as Difficulty })
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:w-32"
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editState.company}
                        onChange={(e) => setEditState({ ...editState, company: e.target.value })}
                        list={COMPANY_LIST_ID}
                        placeholder="Company (optional)"
                        aria-label="Company"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:flex-1"
                      />
                    </div>
                    <textarea
                      value={editState.prompt}
                      onChange={(e) => setEditState({ ...editState, prompt: e.target.value })}
                      rows={2}
                      className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => saveEdit(question.id)}
                        disabled={!editState.prompt.trim() || savingId === question.id}
                        className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingId === question.id ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:border-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {question.category}
                        </span>
                        <span className="text-xs text-muted">{question.difficulty}</span>
                        {question.company && (
                          <span className="text-xs font-medium text-muted">{question.company}</span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{question.prompt}</p>
                    </div>
                    <div className="flex flex-none gap-2">
                      <button
                        onClick={() => startEdit(question)}
                        className="rounded-full border border-border px-3 py-1 text-xs font-medium hover:border-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        disabled={deletingId === question.id}
                        className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600 hover:border-red-600 disabled:opacity-50"
                      >
                        {deletingId === question.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
