import { getSupabaseClient } from "@/lib/supabase";
import type { FeedbackRating, Question } from "@/types";

export async function saveAttempt(input: {
  userId: string;
  question: Question;
  answer: string;
  score: number;
  bullets: string[];
  model: string;
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: input.userId,
      question_id: input.question.id,
      question_text: input.question.prompt,
      category: input.question.category,
      difficulty: input.question.difficulty,
      answer: input.answer,
      score: input.score,
      bullets: input.bullets,
      model: input.model,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// Returns false if the attempt doesn't exist or belongs to another user.
export async function setRating(
  userId: string,
  attemptId: string,
  rating: FeedbackRating,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("id")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();

  if (attemptError) throw new Error(attemptError.message);
  if (!attempt) return false;

  const { error } = await supabase
    .from("feedback_ratings")
    .upsert({ attempt_id: attemptId, user_id: userId, rating }, { onConflict: "attempt_id" });

  if (error) throw new Error(error.message);
  return true;
}
