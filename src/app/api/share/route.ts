import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createShareId } from "@/lib/attemptsDb";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  const limited = checkRateLimit(req, "share", 30);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const attemptId = z.uuid().safeParse(body.attemptId);
  if (!attemptId.success) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  try {
    const shareId = await createShareId(userId, attemptId.data);
    if (!shareId) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }
    return NextResponse.json({ shareId });
  } catch (error) {
    console.error("Failed to create a share link:", error);
    return NextResponse.json({ error: "Failed to create your share link" }, { status: 500 });
  }
}
