import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getSharedScore } from "@/lib/attemptsDb";
import { questionLabel, scoreOutOfTen, shareHeadline } from "@/lib/scoreCard";

const DESCRIPTION = "Practice PM interview questions and get a score and specific feedback on every answer.";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

async function loadShared(rawId: string) {
  const id = z.uuid().safeParse(rawId);
  return id.success ? getSharedScore(id.data) : null;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const shared = await loadShared((await params).id);
  if (!shared) return { title: "Score not found", robots: { index: false, follow: false } };

  const title = `${shareHeadline(shared.score, shared.company, shared.category)} | PMPrep AI`;
  return {
    title: { absolute: title },
    description: DESCRIPTION,
    robots: { index: false, follow: false },
    openGraph: { title, description: DESCRIPTION, siteName: "PMPrep AI", type: "website" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const shared = await loadShared((await params).id);
  if (!shared) notFound();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        PMPrep AI
      </Link>
      <div className="mt-8 w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        <p className="text-muted">I scored</p>
        <p className="mt-1 text-6xl font-semibold tracking-tight text-primary">
          {scoreOutOfTen(shared.score)}
          <span className="text-2xl font-normal text-muted">/10</span>
        </p>
        <p className="mt-3 text-lg font-medium">on {questionLabel(shared.company, shared.category)}</p>
      </div>
      <p className="mt-8 max-w-md text-balance text-muted">
        How would you do? Practice PM interview questions and get specific feedback on every answer.
      </p>
      <Link
        href="/"
        className="mt-5 rounded-full bg-primary px-8 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Try PMPrep AI
      </Link>
    </main>
  );
}
