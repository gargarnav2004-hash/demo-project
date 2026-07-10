import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/anthropic";
import { QUESTION_BANK } from "@/lib/questions";
import { CATEGORIES, type Category } from "@/types";

const SelectionSchema = z.object({
  question_id: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const category = body.category as Category;
  const excludeIds: string[] = Array.isArray(body.excludeIds) ? body.excludeIds : [];

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const bank = QUESTION_BANK[category];
  const candidates = bank.filter((q) => !excludeIds.includes(q.id));
  const pool = candidates.length > 0 ? candidates : bank;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system:
        "You are selecting the next practice question for a PM interview candidate. Given a category and a list of candidate questions, pick the single question id that would be the best next question for variety and coverage. Respond with only that id.",
      messages: [
        {
          role: "user",
          content: `Category: ${category}\n\nCandidate questions:\n${pool
            .map((q) => `${q.id}: ${q.prompt}`)
            .join("\n")}`,
        },
      ],
      output_config: { format: zodOutputFormat(SelectionSchema) },
    });

    const chosenId = response.parsed_output?.question_id;
    const question = pool.find((q) => q.id === chosenId) ?? pool[0];

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to select question via Claude:", error);
    return NextResponse.json(
      { error: "Failed to select a question. Check your ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }
}
