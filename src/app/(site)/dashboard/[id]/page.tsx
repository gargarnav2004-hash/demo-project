import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import ScoreRow from "@/components/ScoreRow";
import { getUserAttempt } from "@/lib/attemptsDb";
import { formatDate } from "@/lib/progress";

export const metadata: Metadata = {
  title: "Past answer",
  robots: { index: false, follow: false },
};

interface AttemptPageProps {
  params: Promise<{ id: string }>;
}

export default async function AttemptPage({ params }: AttemptPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const attempt = await getUserAttempt(userId, id.data);
  if (!attempt) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Back to your progress
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {attempt.category}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {attempt.difficulty}
        </span>
        <span className="text-xs text-muted">{formatDate(attempt.createdAt)}</span>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
        <p className="text-lg font-medium leading-relaxed">{attempt.questionText}</p>
      </div>

      <h2 className="mt-6 text-sm font-medium text-muted">Your answer</h2>
      <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed">
        {attempt.answer}
      </p>

      <h2 className="mt-6 text-sm font-medium text-muted">Feedback</h2>
      <div className="mt-2 rounded-2xl border border-border bg-surface p-6">
        <ScoreRow score={attempt.score} />
        <ul className="mt-4 space-y-2">
          {attempt.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
