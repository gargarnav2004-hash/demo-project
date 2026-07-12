"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QuestionsAdmin from "@/components/admin/QuestionsAdmin";
import RubricsAdmin from "@/components/admin/RubricsAdmin";

type Tab = "questions" | "rubrics";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("questions");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PMPrep AI Admin</h1>
          <p className="mt-1 text-sm text-muted">Manage the question bank and grading rubrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            View practice app
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary disabled:opacity-50"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("questions")}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            tab === "questions"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Questions
        </button>
        <button
          onClick={() => setTab("rubrics")}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
            tab === "rubrics"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Rubrics
        </button>
      </div>

      <div className="mt-6">
        {tab === "questions" ? <QuestionsAdmin /> : <RubricsAdmin />}
      </div>
    </div>
  );
}
