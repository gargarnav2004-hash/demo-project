"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/Hero";
import CategorySelector from "@/components/CategorySelector";
import PracticeScreen from "@/components/PracticeScreen";
import type { Category, Question } from "@/types";

type View = "hero" | "category" | "practice";

export default function Home() {
  const [view, setView] = useState<View>("hero");
  const [category, setCategory] = useState<Category | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async (cat: Category, excludeIds: string[]) => {
    setLoadingQuestion(true);
    setError(null);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, excludeIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load a question");
      }
      const data: { question: Question } = await res.json();
      setQuestion(data.question);
      setAskedIds((prev) => [...prev, data.question.id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingQuestion(false);
    }
  }, []);

  function handleSelectCategory(cat: Category) {
    setCategory(cat);
    setQuestion(null);
    setAskedIds([]);
    setView("practice");
    fetchQuestion(cat, []);
  }

  function handleNextQuestion() {
    if (!category) return;
    fetchQuestion(category, askedIds);
  }

  function handleChangeCategory() {
    setView("category");
    setCategory(null);
    setQuestion(null);
    setAskedIds([]);
  }

  return (
    <div className="flex flex-1 flex-col">
      {view === "hero" && <Hero onStart={() => setView("category")} />}
      {view === "category" && <CategorySelector onSelect={handleSelectCategory} />}
      {view === "practice" && category && (
        <PracticeScreen
          category={category}
          question={question}
          loadingQuestion={loadingQuestion}
          error={error}
          onNextQuestion={handleNextQuestion}
          onChangeCategory={handleChangeCategory}
        />
      )}
    </div>
  );
}
