import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { saveAttempt } from "@/lib/attemptsDb";
import { getQuestionById } from "@/lib/questionsDb";
import { getRubric } from "@/lib/rubricsDb";
import { checkRateLimit } from "@/lib/rateLimit";
import { consumeAiCall, releaseAiCall, USER_DAILY_LIMIT } from "@/lib/usageDb";
import { MAX_ANSWER_LENGTH, type Question } from "@/types";

// The API doesn't enforce array lengths, so extra bullets are trimmed below
// rather than failing a response the user is waiting for.
const MAX_BULLETS = 3;

const FeedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  bullets: z.array(z.string()).min(1),
});

const LIMIT_MESSAGES = {
  daily_limit: `You've used all ${USER_DAILY_LIMIT} feedback requests for today. Your limit resets at midnight IST, so come back then for more practice.`,
  app_limit:
    "PMPrep AI has reached its feedback limit for today. It resets at midnight IST, so please come back then.",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  const limited = checkRateLimit(req, "feedback", 10);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const questionId = z.uuid().safeParse(body.questionId);
  const answer = typeof body.answer === "string" ? body.answer : "";

  if (!questionId.success || !answer.trim()) {
    return NextResponse.json({ error: "Missing question or answer" }, { status: 400 });
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json(
      { error: `Answer must be at most ${MAX_ANSWER_LENGTH} characters.` },
      { status: 400 },
    );
  }

  let question: Question | null;
  let rubric: string | null;
  let quota: Awaited<ReturnType<typeof consumeAiCall>>;
  try {
    // The question comes from the database, never the browser, so saved scores
    // always belong to a real question.
    question = await getQuestionById(questionId.data);
    if (!question) {
      return NextResponse.json({ error: "That question no longer exists." }, { status: 404 });
    }
    rubric = await getRubric(question.category);
    if (!rubric) {
      return NextResponse.json(
        { error: `No rubric configured for ${question.category}. Add one in the admin panel.` },
        { status: 404 },
      );
    }
    quota = await consumeAiCall(userId);
  } catch (error) {
    // Fails closed: without a working limit check, no Claude call is made.
    console.error("Failed to check the feedback limit:", error);
    return NextResponse.json(
      { error: "Feedback is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  if (!quota.allowed) {
    return NextResponse.json(
      { error: LIMIT_MESSAGES[quota.reason], code: quota.reason },
      { status: 429 },
    );
  }

  let score: number;
  let bullets: string[];
  try {
    const client = getAnthropicClient();
    const response = await client.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: `You are an experienced PM interviewer giving direct, constructive feedback on a candidate's answer to a ${question.category} interview question. Grade against this rubric:\n${rubric}\n\nScore from 1 (weak) to 5 (excellent). Give exactly 2-3 bullet points of specific, actionable feedback referencing details from the candidate's actual answer — not generic advice.`,
      messages: [
        {
          role: "user",
          content: `Question: ${question.prompt}\n\nCandidate's answer:\n${answer}`,
        },
      ],
      output_config: { format: zodOutputFormat(FeedbackSchema) },
    });

    if (!response.parsed_output) {
      throw new Error("Claude did not return parsed output");
    }

    score = response.parsed_output.score;
    bullets = response.parsed_output.bullets.slice(0, MAX_BULLETS);
  } catch (error) {
    // Covers every Claude failure, including the API credits running out.
    console.error("Failed to generate feedback via Claude:", error);
    await releaseAiCall(userId, quota.usageDate).catch((releaseError) =>
      console.error("Failed to release the feedback limit:", releaseError),
    );
    return NextResponse.json(
      {
        error:
          "We couldn't score your answer right now, so this didn't count toward your daily limit. Your answer is still here. Please try again later.",
      },
      { status: 503 },
    );
  }

  // A failed save shouldn't cost the user feedback they've already got.
  const attemptId = await saveAttempt({
    userId,
    question,
    answer,
    score,
    bullets,
    model: CLAUDE_MODEL,
  }).catch((error) => {
    console.error("Failed to save the attempt:", error);
    return null;
  });

  return NextResponse.json({ score, bullets, attemptId });
}
