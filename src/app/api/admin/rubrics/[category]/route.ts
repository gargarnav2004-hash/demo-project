import { NextRequest, NextResponse } from "next/server";
import { updateRubric } from "@/lib/rubricsDb";
import { CATEGORIES, type Category } from "@/types";

interface RouteContext {
  params: Promise<{ category: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory) as Category;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const criteria = typeof body.criteria === "string" ? body.criteria.trim() : "";
  if (!criteria) {
    return NextResponse.json({ error: "Rubric text cannot be empty" }, { status: 400 });
  }

  try {
    const rubric = await updateRubric(category, criteria);
    return NextResponse.json({ rubric });
  } catch (error) {
    console.error("Failed to update rubric:", error);
    return NextResponse.json({ error: "Failed to update rubric" }, { status: 500 });
  }
}
