import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";
import {
  RUBRIC_DIMENSIONS,
  type Category,
  type EvalItem,
  type EvalStats,
  type RubricDimension,
} from "@/types";

const SCORE_COLUMNS =
  "structure_score, user_focus_score, metrics_score, tradeoffs_score, communication_score";
const MAX_ITEMS = 100;

type ScoreRow = Record<`${RubricDimension}_score`, number>;

interface EvalRow extends ScoreRow {
  id: string;
  category: Category;
  question_text: string;
  answer: string;
  human_scores: ScoreRow | null;
}

// /admin/eval is for one Clerk account, and fails closed if none is configured.
export async function isEvalAdmin(): Promise<boolean> {
  const { userId } = await auth();
  const adminId = process.env.ADMIN_CLERK_USER_ID;
  return !!adminId && userId === adminId;
}

function toScores(row: ScoreRow): Record<RubricDimension, number> {
  return {
    structure: row.structure_score,
    user_focus: row.user_focus_score,
    metrics: row.metrics_score,
    tradeoffs: row.tradeoffs_score,
    communication: row.communication_score,
  };
}

function rate(matches: number, total: number): number | null {
  return total === 0 ? null : matches / total;
}

export function computeEvalStats(
  pairs: { ai: Record<RubricDimension, number>; human: Record<RubricDimension, number> }[],
): EvalStats {
  const dimensions = RUBRIC_DIMENSIONS.map(({ key, label }) => {
    const exact = pairs.filter((p) => p.ai[key] === p.human[key]).length;
    const withinOne = pairs.filter((p) => Math.abs(p.ai[key] - p.human[key]) <= 1).length;
    return {
      key,
      label,
      exact,
      withinOne,
      exactRate: rate(exact, pairs.length),
      withinOneRate: rate(withinOne, pairs.length),
    };
  });

  const scoreCount = pairs.length * RUBRIC_DIMENSIONS.length;
  const difference = pairs.reduce(
    (sum, p) => sum + RUBRIC_DIMENSIONS.reduce((s, { key }) => s + p.ai[key] - p.human[key], 0),
    0,
  );

  return {
    graded: pairs.length,
    exactRate: rate(dimensions.reduce((sum, d) => sum + d.exact, 0), scoreCount),
    withinOneRate: rate(dimensions.reduce((sum, d) => sum + d.withinOne, 0), scoreCount),
    averageDifference: scoreCount === 0 ? null : difference / scoreCount,
    dimensions: dimensions.map(({ key, label, exactRate, withinOneRate }) => ({
      key,
      label,
      exactRate,
      withinOneRate,
    })),
  };
}

export async function getEvalStats(): Promise<EvalStats> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("human_scores")
    .select(`${SCORE_COLUMNS}, attempts (${SCORE_COLUMNS})`);

  if (error) throw new Error(error.message);
  const rows = data as unknown as (ScoreRow & { attempts: ScoreRow })[];
  return computeEvalStats(rows.map((row) => ({ ai: toScores(row.attempts), human: toScores(row) })));
}

// Ungraded answers come first, newest first. No user ids are selected, so
// answers are graded without knowing who wrote them.
export async function getEvalItems(): Promise<EvalItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select(`id, category, question_text, answer, ${SCORE_COLUMNS}, human_scores (${SCORE_COLUMNS})`)
    .not("structure_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(MAX_ITEMS);

  if (error) throw new Error(error.message);
  const rows = data as unknown as EvalRow[];
  const items = rows.map((row) => ({
    attemptId: row.id,
    category: row.category,
    questionText: row.question_text,
    answer: row.answer,
    aiScores: toScores(row),
    humanScores: row.human_scores ? toScores(row.human_scores) : null,
  }));
  return [...items.filter((i) => !i.humanScores), ...items.filter((i) => i.humanScores)];
}

export async function saveHumanScores(
  attemptId: string,
  scores: Record<RubricDimension, number>,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("human_scores").upsert(
    {
      attempt_id: attemptId,
      structure_score: scores.structure,
      user_focus_score: scores.user_focus,
      metrics_score: scores.metrics,
      tradeoffs_score: scores.tradeoffs,
      communication_score: scores.communication,
    },
    { onConflict: "attempt_id" },
  );

  if (error) throw new Error(error.message);
}
