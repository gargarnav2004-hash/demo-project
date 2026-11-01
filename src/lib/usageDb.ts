import { getSupabaseClient } from "@/lib/supabase";

export const USER_DAILY_LIMIT = 20;
const DEFAULT_APP_DAILY_LIMIT = 300;

export type QuotaResult =
  | { allowed: true; usageDate: string }
  | { allowed: false; reason: "daily_limit" | "app_limit"; usageDate: string };

function getAppDailyLimit(): number {
  const limit = Number(process.env.AI_DAILY_CALL_LIMIT);
  return Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_APP_DAILY_LIMIT;
}

// Takes one Claude call from the user's and the app's limits for today (IST).
export async function consumeAiCall(userId: string): Promise<QuotaResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("consume_ai_call", {
    p_user_id: userId,
    p_user_limit: USER_DAILY_LIMIT,
    p_app_limit: getAppDailyLimit(),
  });

  if (error) throw new Error(error.message);
  return data.allowed
    ? { allowed: true, usageDate: data.usage_date }
    : { allowed: false, reason: data.reason, usageDate: data.usage_date };
}

export async function releaseAiCall(userId: string, usageDate: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("release_ai_call", {
    p_user_id: userId,
    p_usage_date: usageDate,
  });

  if (error) throw new Error(error.message);
}
