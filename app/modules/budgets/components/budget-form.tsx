import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "~/lib/utils";
import { CurrencyInput } from "~/components/shared/currency-input";
import { useCategories } from "~/modules/categories/hooks";
import {
  createBudgetSchema,
  type CreateBudgetInput,
  type BudgetResponse,
} from "~/modules/budgets/types";

interface BudgetFormProps {
  budget?: BudgetResponse;
  onSubmit: (data: CreateBudgetInput) => void;
  isPending: boolean;
}

export function BudgetForm({ budget, onSubmit, isPending }: BudgetFormProps) {
  const { data: categories, isLoading: categoriesLoading } =
    useCategories("EXPENSE");

  const form = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: budget?.name ?? "",
      limit: budget?.limit ?? 0,
      categoryIds: budget?.categories.map((c) => c.id) ?? [],
    },
    mode: "onChange",
  });

  const selectedIds = form.watch("categoryIds");

  function toggleCategory(id: string) {
    const current = form.getValues("categoryIds");
    const updated = current.includes(id)
      ? current.filter((cid) => cid !== id)
      : [...current, id];
    form.setValue("categoryIds", updated, { shouldValidate: true });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Nama Budget
        </label>
        <input
          id="name"
          {...form.register("name")}
          placeholder="Budget Bulanan"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Limit per Bulan
        </label>
        <CurrencyInput
          value={form.watch("limit")}
          onValueChange={(val) =>
            form.setValue("limit", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.limit && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.limit.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Kategori
        </label>
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 animate-pulse rounded-full bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories?.map((cat) => {
              const isSelected = selectedIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  <span role="img" aria-label={cat.name}>
                    {cat.icon}
                  </span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}
        {form.formState.errors.categoryIds && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.categoryIds.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending
          ? "Menyimpan..."
          : budget
            ? "Simpan Perubahan"
            : "Tambah Budget"}
      </button>
    </form>
  );
}
