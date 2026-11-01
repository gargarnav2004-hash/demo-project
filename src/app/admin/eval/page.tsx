import { notFound } from "next/navigation";
import EvalBoard from "@/components/admin/EvalBoard";
import { getEvalItems, getEvalStats, isEvalAdmin } from "@/lib/evalDb";

export default async function AdminEvalPage() {
  if (!(await isEvalAdmin())) notFound();

  const [items, stats] = await Promise.all([getEvalItems(), getEvalStats()]);

  return <EvalBoard items={items} initialStats={stats} />;
}
