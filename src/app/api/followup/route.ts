import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { getFollowUpContext, saveFollowUp, type FollowUpContext } from "@/lib/attemptsDb";
import { checkRateLimit } from "@/lib/rateLimit";
import { FollowUpFeedbackSchema, followUpSystemPrompt, overallScore, trimBullets } from "@/lib/rubric";
import { getRubric } from "@/lib/rubricsDb";
import { consumeAiCall, releaseAiCall } from "@/lib/usageDb";
import { LIMIT_MESSAGES, SCORING_FAILED_MESSAGE } from "@/lib/usageMessages";
import { MAX_ANSWER_LENGTH, type FollowUpResult } from "@/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  const limited = checkRateLimit(req, "followup", 10);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const attemptId = z.uuid().safeParse(body.attemptId);
  const answer = typeof body.answer === "string" ? body.answer : "";

  if (!attemptId.success || !answer.trim()) {
    return NextResponse.json({ error: "Missing follow-up answer" }, { status: 400 });
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json(
      { error: `Answer must be at most ${MAX_ANSWER_LENGTH} characters.` },
      { status: 400 },
    );
  }

  let context: FollowUpContext | null;
  let guidance: string | null;
  let quota: Awaited<ReturnType<typeof consumeAiCall>>;
  try {
    context = await getFollowUpContext(userId, attemptId.data);
    if (!context) {
      return NextResponse.json({ error: "Follow-up question not found" }, { status: 404 });
    }
    if (context.alreadyAnswered) {
      return NextResponse.json(
        { error: "You've already answered this follow-up." },
        { status: 409 },
      );
    }
    guidance = await getRubric(context.category);
    if (!guidance) {
      return NextResponse.json(
        { error: `No rubric configured for ${context.category}. Add one in the admin panel.` },
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

  let result: FollowUpResult;
  try {
    const client = getAnthropicClient();
    const response = await client.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      thinking: { type: "disabled" },
      system: followUpSystemPrompt(context.category, guidance),
      messages: [
        {
          role: "user",
          content: `Original question: ${context.questionText}\n\nCandidate's original answer:\n${context.answer}\n\nFollow-up question: ${context.followUpQuestion}\n\nCandidate's answer to the follow-up:\n${answer}`,
        },
      ],
      output_config: { format: zodOutputFormat(FollowUpFeedbackSchema) },
    });

    if (!response.parsed_output) {
      throw new Error("Claude did not return parsed output");
    }

    const { rubric, bullets } = response.parsed_output;
    result = { score: overallScore(rubric), rubric, bullets: trimBullets(bullets) };
  } catch (error) {
    // Covers every Claude failure, including the API credits running out.
    console.error("Failed to score the follow-up via Claude:", error);
    await releaseAiCall(userId, quota.usageDate).catch((releaseError) =>
      console.error("Failed to release the feedback limit:", releaseError),
    );
    return NextResponse.json({ error: SCORING_FAILED_MESSAGE }, { status: 503 });
  }

  // A failed save shouldn't cost the user feedback they've already got. It also
  // covers a double submit, which the table's primary key rejects.
  await saveFollowUp({
    userId,
    attemptId: attemptId.data,
    question: context.followUpQuestion,
    answer,
    result,
    model: CLAUDE_MODEL,
  }).catch((error) => console.error("Failed to save the follow-up:", error));

  return NextResponse.json(result);
}
