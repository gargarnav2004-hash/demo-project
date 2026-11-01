import { USER_DAILY_LIMIT } from "@/lib/usageDb";

export const LIMIT_MESSAGES = {
  daily_limit: `You've used all ${USER_DAILY_LIMIT} feedback requests for today. Your limit resets at midnight IST, so come back then for more practice.`,
  app_limit:
    "PMPrep AI has reached its feedback limit for today. It resets at midnight IST, so please come back then.",
};

export const SCORING_FAILED_MESSAGE =
  "We couldn't score your answer right now, so this didn't count toward your daily limit. Your answer is still here. Please try again later.";
