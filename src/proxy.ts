import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, hashPassword } from "@/lib/adminAuth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const expectedToken = adminPassword ? await hashPassword(adminPassword) : null;
  const isAuthed = !!expectedToken && cookieToken === expectedToken;

  if (isAuthed) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
