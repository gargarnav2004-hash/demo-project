import { getSupabaseClient } from "@/lib/supabase";
import type { Category, Difficulty, Question } from "@/types";

interface QuestionRow {
  id: string;
  category: Category;
  prompt: string;
  difficulty: Difficulty;
}

function toQuestion(row: QuestionRow): Question {
  return { id: row.id, category: row.category, prompt: row.prompt, difficulty: row.difficulty };
}

export async function getQuestionsByCategory(category: Category): Promise<Question[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, category, prompt, difficulty")
    .eq("category", category)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as QuestionRow[]).map(toQuestion);
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, category, prompt, difficulty")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toQuestion(data as QuestionRow) : null;
}

export async function getAllQuestions(): Promise<Question[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, category, prompt, difficulty")
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as QuestionRow[]).map(toQuestion);
}

export async function createQuestion(input: {
  category: Category;
  prompt: string;
  difficulty: Difficulty;
}): Promise<Question> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .insert(input)
    .select("id, category, prompt, difficulty")
    .single();

  if (error) throw new Error(error.message);
  return toQuestion(data as QuestionRow);
}

export async function updateQuestion(
  id: string,
  input: Partial<{ category: Category; prompt: string; difficulty: Difficulty }>,
): Promise<Question> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .update(input)
    .eq("id", id)
    .select("id, category, prompt, difficulty")
    .single();

  if (error) throw new Error(error.message);
  return toQuestion(data as QuestionRow);
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
