"use client";

import { useCallback, useEffect, useState } from "react";
import CategorySelector from "@/components/CategorySelector";
import PracticeScreen from "@/components/PracticeScreen";
import { questionProps, track } from "@/lib/analytics";
import type { Category, CompanyOption, Question } from "@/types";

type View = "category" | "practice";

export default function PracticeFlow() {
  const [view, setView] = useState<View>("category");
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [company, setCompany] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [askedIds, setAskedIds] = useState<string[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    // The filter is optional, so practice carries on without it if this fails.
    async function loadCompanies() {
      const res = await fetch("/api/companies").catch(() => null);
      if (!res?.ok) return;
      const data: { companies: CompanyOption[] } = await res.json();
      if (!ignore) setCompanies(data.companies);
    }

    loadCompanies();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchQuestion = useCallback(
    async (cat: Category, selectedCompany: string | null, excludeIds: string[]) => {
      setLoadingQuestion(true);
      setError(null);
      try {
        const res = await fetch("/api/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: cat, company: selectedCompany, excludeIds }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load a question");
        }
        const data: { question: Question } = await res.json();
        setQuestion(data.question);
        setAskedIds((prev) => [...prev, data.question.id]);
        track("question_started", questionProps(data.question));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingQuestion(false);
      }
    },
    [],
  );

  function handleSelectCategory(cat: Category) {
    setCategory(cat);
    setQuestion(null);
    setAskedIds([]);
    setView("practice");
    fetchQuestion(cat, company, []);
  }

  function handleNextQuestion() {
    if (!category) return;
    fetchQuestion(category, company, askedIds);
  }

  function handleChangeCategory() {
    setView("category");
    setCategory(null);
    setQuestion(null);
    setAskedIds([]);
  }

  return (
    <div className="flex flex-1 flex-col">
      {view === "category" && (
        <CategorySelector
          companies={companies}
          company={company}
          onSelectCompany={setCompany}
          onSelect={handleSelectCategory}
        />
      )}
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
