import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { setRating } from "@/lib/attemptsDb";
import { checkRateLimit } from "@/lib/rateLimit";

const RatingSchema = z.object({
  attemptId: z.uuid(),
  rating: z.enum(["up", "down"]),
  target: z.enum(["answer", "followup"]).default("answer"),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to practice." }, { status: 401 });
  }

  const limited = checkRateLimit(req, "rating", 30);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const parsed = RatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  try {
    const { attemptId, rating, target } = parsed.data;
    const saved = await setRating(userId, attemptId, rating, target);
    if (!saved) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save the rating:", error);
    return NextResponse.json({ error: "Failed to save your rating" }, { status: 500 });
  }
}
