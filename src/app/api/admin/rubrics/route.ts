import { NextResponse } from "next/server";
import { getAllRubrics } from "@/lib/rubricsDb";

export async function GET() {
  try {
    const rubrics = await getAllRubrics();
    return NextResponse.json({ rubrics });
  } catch (error) {
    console.error("Failed to list rubrics:", error);
    return NextResponse.json({ error: "Failed to load rubrics" }, { status: 500 });
  }
}
