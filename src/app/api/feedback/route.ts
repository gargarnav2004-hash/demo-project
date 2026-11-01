import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { saveAttempt } from "@/lib/attemptsDb";
import { getQuestionById } from "@/lib/questionsDb";
import { checkRateLimit } from "@/lib/rateLimit";
import { FeedbackSchema, feedbackSystemPrompt, overallScore, trimBullets } from "@/lib/rubric";
import { getRubric } from "@/lib/rubricsDb";
import { consumeAiCall, releaseAiCall } from "@/lib/usageDb";
import { LIMIT_MESSAGES, SCORING_FAILED_MESSAGE } from "@/lib/usageMessages";
import { MAX_ANSWER_LENGTH, type FollowUpResult, type Question } from "@/types";

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
  let guidance: string | null;
  let quota: Awaited<ReturnType<typeof consumeAiCall>>;
  try {
    // The question comes from the database, never the browser, so saved scores
    // always belong to a real question.
    question = await getQuestionById(questionId.data);
    if (!question) {
      return NextResponse.json({ error: "That question no longer exists." }, { status: 404 });
    }
    guidance = await getRubric(question.category);
    if (!guidance) {
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

  let result: FollowUpResult;
  let followUpQuestion: string;
  try {
    const client = getAnthropicClient();
    const response = await client.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      thinking: { type: "disabled" },
      system: feedbackSystemPrompt(question.category, guidance),
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

    const { rubric, bullets, follow_up_question } = response.parsed_output;
    result = { score: overallScore(rubric), rubric, bullets: trimBullets(bullets) };
    followUpQuestion = follow_up_question;
  } catch (error) {
    // Covers every Claude failure, including the API credits running out.
    console.error("Failed to generate feedback via Claude:", error);
    await releaseAiCall(userId, quota.usageDate).catch((releaseError) =>
      console.error("Failed to release the feedback limit:", releaseError),
    );
    return NextResponse.json({ error: SCORING_FAILED_MESSAGE }, { status: 503 });
  }

  // A failed save shouldn't cost the user feedback they've already got.
  const attemptId = await saveAttempt({
    userId,
    question,
    answer,
    ...result,
    followUpQuestion,
    model: CLAUDE_MODEL,
  }).catch((error) => {
    console.error("Failed to save the attempt:", error);
    return null;
  });

  return NextResponse.json({ ...result, followUpQuestion, attemptId });
}
