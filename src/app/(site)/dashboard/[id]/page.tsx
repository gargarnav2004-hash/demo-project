import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import RubricBreakdown from "@/components/RubricBreakdown";
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
        <RubricBreakdown score={attempt.score} rubric={attempt.rubric} bullets={attempt.bullets} />
      </div>

      {attempt.followUpQuestion && (
        <div className="mt-6 rounded-2xl border border-border bg-primary/5 p-5">
          <h2 className="text-sm font-medium text-primary">The interviewer followed up</h2>
          <p className="mt-2 font-medium leading-relaxed">{attempt.followUpQuestion}</p>
          {attempt.followUp ? (
            <>
              <h3 className="mt-4 text-sm font-medium text-muted">Your answer</h3>
              <p className="mt-2 whitespace-pre-wrap break-words rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed">
                {attempt.followUp.answer}
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
                <RubricBreakdown
                  score={attempt.followUp.score}
                  rubric={attempt.followUp.rubric}
                  bullets={attempt.followUp.bullets}
                />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">You didn&apos;t answer this follow-up.</p>
          )}
        </div>
      )}
    </main>
  );
}
