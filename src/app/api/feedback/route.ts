import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { RUBRICS } from "@/lib/rubric";
import { CATEGORIES, type Category } from "@/types";

const FeedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  bullets: z.array(z.string()).min(2).max(3),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const category = body.category as Category;
  const question: string = body.question;
  const answer: string = body.answer;

  if (!CATEGORIES.includes(category) || !question || !answer?.trim()) {
    return NextResponse.json({ error: "Missing category, question, or answer" }, { status: 400 });
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: `You are an experienced PM interviewer giving direct, constructive feedback on a candidate's answer to a ${category} interview question. Grade against this rubric:\n${RUBRICS[category]}\n\nScore from 1 (weak) to 5 (excellent). Give exactly 2-3 bullet points of specific, actionable feedback referencing details from the candidate's actual answer — not generic advice.`,
      messages: [
        {
          role: "user",
          content: `Question: ${question}\n\nCandidate's answer:\n${answer}`,
        },
      ],
      output_config: { format: zodOutputFormat(FeedbackSchema) },
    });

    if (!response.parsed_output) {
      throw new Error("Claude did not return parsed output");
    }

    return NextResponse.json(response.parsed_output);
  } catch (error) {
    console.error("Failed to generate feedback via Claude:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback. Check your ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }
}
