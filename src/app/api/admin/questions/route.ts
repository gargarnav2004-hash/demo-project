import { NextRequest, NextResponse } from "next/server";
import { createQuestion, getAllQuestions } from "@/lib/questionsDb";
import { CATEGORIES, DIFFICULTIES, type Category, type Difficulty } from "@/types";

export async function GET() {
  try {
    const questions = await getAllQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to list questions:", error);
    return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const category = body.category as Category;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const difficulty = body.difficulty as Difficulty;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Question text is required" }, { status: 400 });
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
  }

  try {
    const question = await createQuestion({ category, prompt, difficulty });
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
