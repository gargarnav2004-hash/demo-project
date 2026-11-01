import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getQuestionsByCategory } from "@/lib/questionsDb";
import { checkRateLimit } from "@/lib/rateLimit";
import { CATEGORIES, type Category } from "@/types";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  const limited = checkRateLimit(req, "question", 20);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const category = body.category as Category;
  const excludeIds: string[] = Array.isArray(body.excludeIds) ? body.excludeIds : [];
  const company = typeof body.company === "string" && body.company ? body.company : null;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const bank = await getQuestionsByCategory(category, company);
    if (bank.length === 0) {
      return NextResponse.json(
        {
          error: company
            ? `No ${category} questions for ${company} yet. Try another category.`
            : `No questions found for ${category}. Add some in the admin panel.`,
        },
        { status: 404 },
      );
    }

    const candidates = bank.filter((q) => !excludeIds.includes(q.id));
    const pool = candidates.length > 0 ? candidates : bank;
    const question = pool[Math.floor(Math.random() * pool.length)];

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to select a question:", error);
    return NextResponse.json(
      { error: "Failed to load a question. Please try again later." },
      { status: 500 },
    );
  }
}
