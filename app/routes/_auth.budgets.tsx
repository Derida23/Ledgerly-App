import { Link } from "react-router";
import { Plus, PiggyBank } from "lucide-react";
import { Header } from "~/components/layout/header";
import { EmptyState } from "~/components/shared/empty-state";
import { useIsAdmin } from "~/modules/auth/hooks";
import { useBudgets, useDeleteBudget } from "~/modules/budgets/hooks";
import { BudgetCard } from "~/modules/budgets/components";

export default function BudgetsPage() {
  const isAdmin = useIsAdmin();
  const { data: budgets, isLoading, isError, error, refetch } = useBudgets();
  const deleteMutation = useDeleteBudget();

  return (
    <section>
      <Header
        title="Budget"
        action={
          isAdmin ? (
            <Link
              to="/budgets/new"
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Tambah budget"
            >
              <Plus className="h-5 w-5" />
            </Link>
          ) : undefined
        }
      />
      <main className="p-4 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="font-medium">Gagal memuat data</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Coba Lagi
            </button>
          </div>
        ) : !budgets?.length ? (
          <EmptyState icon={PiggyBank} message="Belum ada budget" />
        ) : (
          <ul className="space-y-4">
            {budgets.map((budget) => (
              <li key={budget.id}>
                <BudgetCard
                  budget={budget}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </section>
  );
}
