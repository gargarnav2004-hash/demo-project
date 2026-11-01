import { getSupabaseClient } from "@/lib/supabase";
import { PROMPT_VERSION, rubricColumns, rubricFromRow } from "@/lib/rubric";
import type {
  Attempt,
  AttemptSummary,
  Category,
  Difficulty,
  FeedbackRating,
  FollowUpResult,
  Question,
  RatingTarget,
  RubricDimension,
  RubricResult,
} from "@/types";

interface RubricRow {
  structure_score: number | null;
  user_focus_score: number | null;
  metrics_score: number | null;
  tradeoffs_score: number | null;
  communication_score: number | null;
  rubric_comments: Record<RubricDimension, string> | null;
}

interface AttemptSummaryRow {
  id: string;
  question_text: string;
  category: Category;
  difficulty: Difficulty;
  company: string | null;
  score: number;
  created_at: string;
}

interface FollowUpRow extends RubricRow {
  answer: string;
  score: number;
  bullets: string[];
}

interface AttemptRow extends AttemptSummaryRow, RubricRow {
  answer: string;
  bullets: string[];
  followup_question: string | null;
  followups: FollowUpRow | null;
}

const RUBRIC_COLUMNS =
  "structure_score, user_focus_score, metrics_score, tradeoffs_score, communication_score, rubric_comments";

function toSummary(row: AttemptSummaryRow): AttemptSummary {
  return {
    id: row.id,
    questionText: row.question_text,
    category: row.category,
    difficulty: row.difficulty,
    company: row.company,
    score: Number(row.score),
    createdAt: row.created_at,
  };
}

export async function saveAttempt(input: {
  userId: string;
  question: Question;
  answer: string;
  score: number;
  rubric: RubricResult;
  bullets: string[];
  followUpQuestion: string;
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
      company: input.question.company,
      answer: input.answer,
      score: input.score,
      ...rubricColumns(input.rubric),
      bullets: input.bullets,
      followup_question: input.followUpQuestion,
      model: input.model,
      prompt_version: PROMPT_VERSION,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// Newest first. Supabase returns at most 1000 rows, so progress stats cover the
// user's latest 1000 answers; `total` is always the full count.
export async function getUserAttempts(
  userId: string,
): Promise<{ attempts: AttemptSummary[]; total: number }> {
  const supabase = getSupabaseClient();
  const { data, error, count } = await supabase
    .from("attempts")
    .select("id, question_text, category, difficulty, company, score, created_at", { count: "exact" })
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
    .select(
      `id, question_text, category, difficulty, company, score, created_at, answer, bullets, followup_question, ${RUBRIC_COLUMNS},
       followups (answer, score, bullets, ${RUBRIC_COLUMNS})`,
    )
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as unknown as AttemptRow;
  const followUpRubric = row.followups ? rubricFromRow(row.followups) : null;
  return {
    ...toSummary(row),
    answer: row.answer,
    bullets: row.bullets,
    rubric: rubricFromRow(row),
    followUpQuestion: row.followup_question,
    followUp:
      row.followups && followUpRubric
        ? {
            answer: row.followups.answer,
            score: Number(row.followups.score),
            rubric: followUpRubric,
            bullets: row.followups.bullets,
          }
        : null,
  };
}

// Returns false if the attempt doesn't belong to the user, or isn't there to rate.
export async function setRating(
  userId: string,
  attemptId: string,
  rating: FeedbackRating,
  target: RatingTarget,
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (target === "followup") {
    const { data, error } = await supabase
      .from("followups")
      .update({ rating })
      .eq("attempt_id", attemptId)
      .eq("user_id", userId)
      .select("attempt_id");
    if (error) throw new Error(error.message);
    return data.length > 0;
  }

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

export interface FollowUpContext {
  category: Category;
  questionText: string;
  answer: string;
  followUpQuestion: string;
  alreadyAnswered: boolean;
}

// Returns null if the attempt doesn't belong to the user or has no follow-up question.
export async function getFollowUpContext(
  userId: string,
  attemptId: string,
): Promise<FollowUpContext | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select("category, question_text, answer, followup_question, followups (attempt_id)")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.followup_question) return null;
  return {
    category: data.category,
    questionText: data.question_text,
    answer: data.answer,
    followUpQuestion: data.followup_question,
    alreadyAnswered: !!data.followups,
  };
}

export async function saveFollowUp(input: {
  userId: string;
  attemptId: string;
  question: string;
  answer: string;
  result: FollowUpResult;
  model: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("followups").insert({
    attempt_id: input.attemptId,
    user_id: input.userId,
    question: input.question,
    answer: input.answer,
    score: input.result.score,
    ...rubricColumns(input.result.rubric),
    bullets: input.result.bullets,
    model: input.model,
    prompt_version: PROMPT_VERSION,
  });

  if (error) throw new Error(error.message);
}

// Returns the attempt's share id, creating one the first time. Returns null if
// the attempt doesn't belong to the user.
export async function createShareId(userId: string, attemptId: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("share_id")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (attemptError) throw new Error(attemptError.message);
  if (!attempt) return null;
  if (attempt.share_id) return attempt.share_id;

  const shareId = crypto.randomUUID();
  const { error } = await supabase.from("attempts").update({ share_id: shareId }).eq("id", attemptId);
  if (error) throw new Error(error.message);
  return shareId;
}

export interface SharedScore {
  score: number;
  category: Category;
  company: string | null;
}

// Public: selects only what a share card shows, never the answer or the user.
export async function getSharedScore(shareId: string): Promise<SharedScore | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select("score, category, company")
    .eq("share_id", shareId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? { score: Number(data.score), category: data.category, company: data.company } : null;
}
