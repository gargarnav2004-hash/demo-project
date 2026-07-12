import { NextRequest, NextResponse } from "next/server";
import { deleteQuestion, updateQuestion } from "@/lib/questionsDb";
import { CATEGORIES, DIFFICULTIES, type Category, type Difficulty } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const update: Partial<{ category: Category; prompt: string; difficulty: Difficulty }> = {};

  if (body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    update.category = body.category;
  }
  if (body.prompt !== undefined) {
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Question text cannot be empty" }, { status: 400 });
    }
    update.prompt = prompt;
  }
  if (body.difficulty !== undefined) {
    if (!DIFFICULTIES.includes(body.difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }
    update.difficulty = body.difficulty;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const question = await updateQuestion(id, update);
    return NextResponse.json({ question });
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    await deleteQuestion(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
