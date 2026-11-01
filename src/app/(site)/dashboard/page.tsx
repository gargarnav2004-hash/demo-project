import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import { getUserAttempts } from "@/lib/attemptsDb";
import { computeProgress, formatDate } from "@/lib/progress";
import { formatScore } from "@/lib/rubric";
import type { AttemptSummary } from "@/types";

export const metadata: Metadata = {
  title: "Your progress",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface DashboardPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function loadAttempts(
  userId: string,
): Promise<{ attempts: AttemptSummary[]; total: number } | null> {
  try {
    return await getUserAttempts(userId);
  } catch (error) {
    console.error("Failed to load the dashboard:", error);
    return null;
  }
}

function StartPracticingLink() {
  return (
    <Link
      href="/practice"
      className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
    >
      Practice
    </Link>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");

  const result = await loadAttempts(userId);
  if (!result) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Your progress</h1>
        <p className="mt-4 text-sm text-red-600">
          We couldn&apos;t load your progress right now. Please try again later.
        </p>
      </main>
    );
  }

  const { attempts, total } = result;
  if (total === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Your progress</h1>
        <p className="mb-6 mt-2 text-muted">
          You haven&apos;t answered any questions yet. Your scores will appear here.
        </p>
        <StartPracticingLink />
      </main>
    );
  }

  const progress = computeProgress(attempts);
  const pageCount = Math.max(Math.ceil(attempts.length / PAGE_SIZE), 1);
  const requestedPage = Number((await searchParams).page);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), pageCount)
    : 1;
  const pageAttempts = attempts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your progress</h1>
        <StartPracticingLink />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Questions answered</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{total.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Current streak</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {progress.streak} {progress.streak === 1 ? "day" : "days"}
          </p>
          {progress.streak > 0 && !progress.practicedToday && (
            <p className="mt-1 text-xs text-muted">Practice today to keep it going.</p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-medium">Score trend</h2>
        <p className="mb-4 mt-1 text-sm text-muted">Your average score out of 5 for each day you practiced.</p>
        <ScoreTrendChart points={progress.trend} />
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-medium">Average score by category</h2>
        <ul className="mt-4 space-y-4">
          {progress.categories.map(({ category, average, count }) => (
            <li key={category}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>{category}</span>
                <span className="flex-none text-muted">
                  {average === null ? (
                    "Not practiced yet"
                  ) : (
                    <>
                      <span className="font-medium text-foreground">{average.toFixed(1)}</span> ·{" "}
                      {count} {count === 1 ? "answer" : "answers"}
                    </>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-border/60">
                {average !== null && (
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(average / 5) * 100}%` }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium">Past answers</h2>
        <ul className="mt-4 space-y-3">
          {pageAttempts.map((attempt) => (
            <li key={attempt.id}>
              <Link
                href={`/dashboard/${attempt.id}`}
                className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {attempt.company ? `${attempt.company} · ${attempt.category}` : attempt.category}
                  </span>
                  <span className="flex-none text-sm font-medium">{formatScore(attempt.score)} / 5</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{attempt.questionText}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(attempt.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>

        {pageCount > 1 && (
          <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Past answers pages">
            {page > 1 ? (
              <Link href={`/dashboard?page=${page - 1}`} className="py-2 font-medium text-primary">
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted">
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={`/dashboard?page=${page + 1}`} className="py-2 font-medium text-primary">
                Older
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
