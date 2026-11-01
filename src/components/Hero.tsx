"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function Hero() {
  const { isSignedIn } = useAuth();
  // Signed-out visitors go to /sign-in and come back to /practice afterwards.
  // (Before Clerk finishes loading we also point at /practice: the proxy sends
  // anyone who isn't signed in to /sign-in with the same return URL.)
  const href = isSignedIn === false ? "/sign-in?redirect_url=/practice" : "/practice";

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">PMPrep AI</h1>
      <p className="mt-4 max-w-md text-balance text-lg text-muted">
        Practice real PM interview questions and get instant, focused feedback.
      </p>
      <Link
        href={href}
        className="mt-10 rounded-full bg-primary px-8 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Start practicing
      </Link>
      {isSignedIn === false && (
        <p className="mt-3 text-sm text-muted">You&apos;ll be asked to sign in or create an account.</p>
      )}
    </section>
  );
}
