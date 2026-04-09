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
      <main className="p-4 pb-24 md:pb-4">
        <BudgetForm onSubmit={handleSubmit} onCancel={() => navigate("/budgets")} isPending={isPending} />
      </main>
    </section>
  );
}
