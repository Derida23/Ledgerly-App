import { useNavigate, useParams } from "react-router";
import { Header } from "~/components/layout/header";
import { TransactionForm } from "~/modules/transactions/components";
import {
  useTransaction,
  useUpdateTransaction,
} from "~/modules/transactions/hooks";
import { TransactionType } from "~/modules/transactions/types";
import type { CreateTransactionInput } from "~/modules/transactions/types";

export default function TransactionEditPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: transaction, isLoading } = useTransaction(id!);
  const { mutate, isPending } = useUpdateTransaction();

  function handleSubmit(data: CreateTransactionInput) {
    mutate(
      {
        id: id!,
        data: {
          amount: data.amount,
          categoryId: data.categoryId,
          method: data.method,
          date: data.date,
          note: data.note,
        },
      },
      { onSuccess: () => navigate("/transactions") },
    );
  }

  const type =
    transaction?.type === TransactionType.INCOME ? "INCOME" : "EXPENSE";

  return (
    <section>
      <Header title="Edit Transaksi" backHref="/transactions" />
      <main className="p-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="grid w-full gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : transaction ? (
          <TransactionForm
            type={type}
            transaction={transaction}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/transactions")}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Transaksi tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}
