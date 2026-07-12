import { getSupabaseClient } from "@/lib/supabase";
import type { Category, Rubric } from "@/types";

export async function getRubric(category: Category): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rubrics")
    .select("criteria")
    .eq("category", category)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.criteria ?? null;
}

export async function getAllRubrics(): Promise<Rubric[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rubrics")
    .select("category, criteria")
    .order("category", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Rubric[];
}

export async function updateRubric(category: Category, criteria: string): Promise<Rubric> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rubrics")
    .upsert({ category, criteria }, { onConflict: "category" })
    .select("category, criteria")
    .single();

  if (error) throw new Error(error.message);
  return data as Rubric;
}
