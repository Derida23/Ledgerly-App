import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
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
  onCancel?: () => void;
  isPending: boolean;
}

export function BudgetForm({ budget, onSubmit, onCancel, isPending }: BudgetFormProps) {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nama Budget
        </label>
        <Input
          {...form.register("name")}
          placeholder="Budget Bulanan"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Limit per Bulan
        </label>
        <CurrencyInput
          value={form.watch("limit")}
          onValueChange={(val) =>
            form.setValue("limit", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.limit && (
          <p className="text-sm text-destructive">
            {form.formState.errors.limit.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-foreground">Kategori</label>
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
                    "inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-accent",
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
          <p className="text-sm text-destructive">
            {form.formState.errors.categoryIds.message}
          </p>
        )}
      </fieldset>

      <div className="md:col-span-2 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" className="w-full md:w-auto md:min-w-32" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          type="submit"
          className="w-full md:w-auto md:min-w-48"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending
            ? "Menyimpan..."
            : budget
              ? "Simpan Perubahan"
              : "Tambah Budget"}
        </Button>
      </div>
    </form>
  );
}
