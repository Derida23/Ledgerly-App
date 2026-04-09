import { useNavigate, useSearchParams } from "react-router";
import { Header } from "~/components/layout/header";
import { TransactionForm } from "~/modules/transactions/components";
import { useCreateTransaction } from "~/modules/transactions/hooks";
import type { CreateTransactionInput } from "~/modules/transactions/types";

export default function TransactionNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") === "income" ? "INCOME" : "EXPENSE";
  const { mutate, isPending } = useCreateTransaction();

  const defaultValues = {
    amount: Number(searchParams.get("amount")) || undefined,
    walletId: searchParams.get("walletId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    note: searchParams.get("note") ?? undefined,
  };

  const title = type === "INCOME" ? "Tambah Pemasukan" : "Tambah Pengeluaran";

  function handleSubmit(data: CreateTransactionInput) {
    mutate(data, {
      onSuccess: () => navigate("/transactions"),
    });
  }

  return (
    <section>
      <Header title={title} backHref="/transactions" />
      <main className="p-4 pb-24 md:pb-4">
        <TransactionForm
          type={type}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/transactions")}
          isPending={isPending}
        />
      </main>
    </section>
  );
}
