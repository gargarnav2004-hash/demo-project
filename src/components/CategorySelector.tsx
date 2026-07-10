import { CATEGORIES, type Category } from "@/types";

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
}

const DESCRIPTIONS: Record<Category, string> = {
  "Product Sense": "Design and improve products for real users.",
  Metrics: "Define, track, and reason about the right numbers.",
  Estimation: "Break down ambiguous quantities with structure.",
  Strategy: "Make the call on markets, positioning, and tradeoffs.",
  Behavioural: "Tell clear, honest stories about your experience.",
  "AI PM": "Judgment for building and shipping AI features.",
};

export default function CategorySelector({ onSelect }: CategorySelectorProps) {
  return (
    <section className="flex flex-1 flex-col items-center px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Choose a category</h2>
      <p className="mt-2 text-muted">Pick where you&apos;d like to practice.</p>
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <span className="text-base font-medium">{category}</span>
            <p className="mt-1 text-sm text-muted">{DESCRIPTIONS[category]}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
