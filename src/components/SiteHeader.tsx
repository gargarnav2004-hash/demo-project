"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export default function SiteHeader() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        PMPrep AI
      </Link>
      <div className="flex h-8 items-center gap-4">
        {!isLoaded ? null : isSignedIn ? (
          <>
            <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
              Dashboard
            </Link>
            <UserButton />
          </>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
