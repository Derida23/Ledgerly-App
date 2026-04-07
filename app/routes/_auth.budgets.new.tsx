import { useNavigate } from "react-router";
import { Header } from "~/components/layout/header";
import { BudgetForm } from "~/modules/budgets/components";
import { useCreateBudget } from "~/modules/budgets/hooks";
import type { CreateBudgetInput } from "~/modules/budgets/types";

export default function BudgetNewPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateBudget();

  function handleSubmit(data: CreateBudgetInput) {
    mutate(data, {
      onSuccess: () => navigate("/budgets"),
    });
  }

  return (
    <section>
      <Header title="Tambah Budget" backHref="/budgets" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        <BudgetForm onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </section>
  );
}
