import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEvalStats, isEvalAdmin, saveHumanScores } from "@/lib/evalDb";

const Score = z.number().int().min(1).max(5);

const EvalSchema = z.object({
  attemptId: z.uuid(),
  scores: z.object({
    structure: Score,
    user_focus: Score,
    metrics: Score,
    tradeoffs: Score,
    communication: Score,
  }),
});

export async function POST(req: NextRequest) {
  if (!(await isEvalAdmin())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = EvalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Each score must be from 1 to 5" }, { status: 400 });
  }

  try {
    await saveHumanScores(parsed.data.attemptId, parsed.data.scores);
    return NextResponse.json({ stats: await getEvalStats() });
  } catch (error) {
    console.error("Failed to save human scores:", error);
    return NextResponse.json({ error: "Failed to save your scores" }, { status: 500 });
  }
}
