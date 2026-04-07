import { useNavigate, useParams } from "react-router";
import { Header } from "~/components/layout/header";
import { BudgetForm } from "~/modules/budgets/components";
import { useBudget, useUpdateBudget } from "~/modules/budgets/hooks";
import type { CreateBudgetInput } from "~/modules/budgets/types";

export default function BudgetEditPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: budget, isLoading } = useBudget(id!);
  const { mutate, isPending } = useUpdateBudget();

  function handleSubmit(data: CreateBudgetInput) {
    mutate(
      { id: id!, data },
      { onSuccess: () => navigate("/budgets") },
    );
  }

  return (
    <section>
      <Header title="Edit Budget" backHref="/budgets" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : budget ? (
          <BudgetForm
            budget={budget}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Budget tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}
