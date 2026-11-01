import { getSupabaseClient } from "@/lib/supabase";
import type { Category, CompanyOption, Difficulty, Question } from "@/types";

const QUESTION_COLUMNS = "id, category, prompt, difficulty, company";

interface QuestionRow {
  id: string;
  category: Category;
  prompt: string;
  difficulty: Difficulty;
  company: string | null;
}

function toQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    category: row.category,
    prompt: row.prompt,
    difficulty: row.difficulty,
    company: row.company,
  };
}

export async function getQuestionsByCategory(
  category: Category,
  company: string | null,
): Promise<Question[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("questions").select(QUESTION_COLUMNS).eq("category", category);
  if (company) query = query.eq("company", company);
  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as QuestionRow[]).map(toQuestion);
}

// The filter is built from the questions themselves, so adding a question with a
// new company in /admin adds that company with no code change.
export async function getCompanyOptions(): Promise<CompanyOption[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("company, category")
    .not("company", "is", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const categoriesByCompany = new Map<string, Set<Category>>();
  for (const row of data as { company: string; category: Category }[]) {
    const categories = categoriesByCompany.get(row.company) ?? new Set<Category>();
    categories.add(row.category);
    categoriesByCompany.set(row.company, categories);
  }
  return [...categoriesByCompany].map(([name, categories]) => ({
    name,
    categories: [...categories],
  }));
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toQuestion(data as QuestionRow) : null;
}

export async function getAllQuestions(): Promise<Question[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as QuestionRow[]).map(toQuestion);
}

export async function createQuestion(input: {
  category: Category;
  prompt: string;
  difficulty: Difficulty;
  company: string | null;
}): Promise<Question> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .insert(input)
    .select(QUESTION_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return toQuestion(data as QuestionRow);
}

export async function updateQuestion(
  id: string,
  input: Partial<{ category: Category; prompt: string; difficulty: Difficulty; company: string | null }>,
): Promise<Question> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .update(input)
    .eq("id", id)
    .select(QUESTION_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return toQuestion(data as QuestionRow);
}

export async function deleteQuestion(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
