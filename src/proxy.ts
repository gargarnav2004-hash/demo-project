import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hashPassword } from "@/lib/adminAuth";

const isPracticePage = createRouteMatcher(["/practice(.*)"]);

// Clerk must see every request so `auth()` works in route handlers. "/" stays
// public; /practice requires a Clerk session (signed-out visitors are sent to
// /sign-in and returned afterwards). The AI API routes (/api/question,
// /api/feedback) check the session themselves and answer 401 JSON, which suits
// fetch() better than a redirect. /admin keeps its separate password gate.
export default clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;

    if (isPracticePage(req)) {
      await auth.protect();
      return;
    }

    const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    if (!isAdminPath || pathname === "/admin/login" || pathname === "/api/admin/login") {
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const expectedToken = adminPassword ? await hashPassword(adminPassword) : null;
    const isAuthed = !!expectedToken && cookieToken === expectedToken;

    if (isAuthed) {
      return;
    }

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login", req.url));
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    // Skip Next.js internals, the PostHog proxy, share images and static files, run for everything else.
    // ".+" also skips the landing page: Clerk's development keys redirect link-preview
    // bots away from any page this runs on, and the page only checks sign-in in the browser.
    "/((?!_next|ingest/|opengraph-image|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).+)",
    "/(api|trpc)(.*)",
  ],
};
