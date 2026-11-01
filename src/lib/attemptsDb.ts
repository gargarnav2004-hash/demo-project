import { getSupabaseClient } from "@/lib/supabase";
import type { Attempt, AttemptSummary, Category, Difficulty, FeedbackRating, Question } from "@/types";

interface AttemptSummaryRow {
  id: string;
  question_text: string;
  category: Category;
  difficulty: Difficulty;
  score: number;
  created_at: string;
}

interface AttemptRow extends AttemptSummaryRow {
  answer: string;
  bullets: string[];
}

function toSummary(row: AttemptSummaryRow): AttemptSummary {
  return {
    id: row.id,
    questionText: row.question_text,
    category: row.category,
    difficulty: row.difficulty,
    score: row.score,
    createdAt: row.created_at,
  };
}

// Newest first. Supabase returns at most 1000 rows, so progress stats cover the
// user's latest 1000 answers; `total` is always the full count.
export async function getUserAttempts(
  userId: string,
): Promise<{ attempts: AttemptSummary[]; total: number }> {
  const supabase = getSupabaseClient();
  const { data, error, count } = await supabase
    .from("attempts")
    .select("id, question_text, category, difficulty, score, created_at", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw new Error(error.message);
  const attempts = (data as AttemptSummaryRow[]).map(toSummary);
  return { attempts, total: count ?? attempts.length };
}

// Returns null if the attempt doesn't exist or belongs to another user.
export async function getUserAttempt(userId: string, id: string): Promise<Attempt | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select("id, question_text, category, difficulty, score, created_at, answer, bullets")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as AttemptRow;
  return { ...toSummary(row), answer: row.answer, bullets: row.bullets };
}

export async function saveAttempt(input: {
  userId: string;
  question: Question;
  answer: string;
  score: number;
  bullets: string[];
  model: string;
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: input.userId,
      question_id: input.question.id,
      question_text: input.question.prompt,
      category: input.question.category,
      difficulty: input.question.difficulty,
      answer: input.answer,
      score: input.score,
      bullets: input.bullets,
      model: input.model,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// Returns false if the attempt doesn't exist or belongs to another user.
export async function setRating(
  userId: string,
  attemptId: string,
  rating: FeedbackRating,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("id")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (attemptError) throw new Error(attemptError.message);
  if (!attempt) return false;

  const { error } = await supabase
    .from("feedback_ratings")
    .upsert({ attempt_id: attemptId, user_id: userId, rating }, { onConflict: "attempt_id" });

  if (error) throw new Error(error.message);
  return true;
}
