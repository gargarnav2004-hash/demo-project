"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { track } from "@/lib/analytics";

const IDENTIFIED_KEY = "pmprep_ph_identified";
// Clerk has no client-side sign-up event, so a brand-new account counts as one.
const NEW_ACCOUNT_WINDOW_MS = 10 * 60_000;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Blocked storage only risks a repeated event, so it's safe to ignore.
  }
}

export default function PostHogIdentify() {
  const { isLoaded, user } = useUser();
  const userId = user?.id;
  const createdAt = user?.createdAt?.getTime();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !isLoaded) return;

    if (!userId) {
      if (readStorage(IDENTIFIED_KEY)) {
        posthog.reset();
        writeStorage(IDENTIFIED_KEY, null);
      }
      return;
    }

    // Only the Clerk id is sent: no email or name goes to PostHog.
    posthog.identify(userId);
    writeStorage(IDENTIFIED_KEY, "1");

    const signedUpKey = `pmprep_signed_up_${userId}`;
    const isNewAccount = !!createdAt && Date.now() - createdAt < NEW_ACCOUNT_WINDOW_MS;
    if (isNewAccount && !readStorage(signedUpKey)) {
      track("signed_up", {});
      writeStorage(signedUpKey, "1");
    }
  }, [isLoaded, userId, createdAt]);

  return null;
}
