import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "@/lib/categories";
import { CATEGORIES, type Category, type CompanyOption } from "@/types";

interface CategorySelectorProps {
  companies: CompanyOption[];
  company: string | null;
  onSelectCompany: (company: string | null) => void;
  onSelect: (category: Category) => void;
}

function CompanyChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface hover:border-primary"
      }`}
    >
      {label}
    </button>
  );
}

export default function CategorySelector({
  companies,
  company,
  onSelectCompany,
  onSelect,
}: CategorySelectorProps) {
  const selectedCompany = companies.find((c) => c.name === company);
  const categories = selectedCompany
    ? CATEGORIES.filter((category) => selectedCompany.categories.includes(category))
    : CATEGORIES;

  return (
    <section className="flex flex-1 flex-col items-center px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Choose a category</h2>
      <p className="mt-2 text-muted">Pick where you&apos;d like to practice.</p>

      {companies.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by company">
            <CompanyChip label="All companies" selected={!company} onClick={() => onSelectCompany(null)} />
            {companies.map(({ name }) => (
              <CompanyChip
                key={name}
                label={name}
                selected={company === name}
                onClick={() => onSelectCompany(name)}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Sample questions themed around each company, not real interview questions from them.
          </p>
        </div>
      )}

      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="rounded-2xl border border-border bg-surface p-5 text-left transition-colors hover:border-primary hover:bg-primary/5"
          >
            <span className="text-base font-medium">{CATEGORY_LABELS[category] ?? category}</span>
            <p className="mt-1 text-sm text-muted">{CATEGORY_DESCRIPTIONS[category]}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
