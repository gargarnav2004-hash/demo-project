import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const SWEEP_THRESHOLD = 5000;

// In-memory sliding window. On serverless hosts each instance keeps its own
// counters, so this is a best-effort guard against casual abuse, not a hard cap.
const hits = new Map<string, number[]>();

function sweep(now: number) {
  for (const [key, timestamps] of hits) {
    if (now - timestamps[timestamps.length - 1] >= WINDOW_MS) hits.delete(key);
  }
}

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Returns a 429 response if the caller exceeded `limit` requests in the last
// minute for this route, otherwise null.
export function checkRateLimit(req: NextRequest, route: string, limit: number): NextResponse | null {
  const now = Date.now();
  const key = `${route}:${getClientIp(req)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  recent.push(now);
  hits.set(key, recent);
  if (hits.size > SWEEP_THRESHOLD) sweep(now);
  return null;
}
