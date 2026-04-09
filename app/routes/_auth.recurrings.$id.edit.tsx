import { useNavigate, useParams } from "react-router";
import { Header } from "~/components/layout/header";
import { RecurringForm } from "~/modules/recurrings/components";
import { useRecurring, useUpdateRecurring } from "~/modules/recurrings/hooks";
import type { CreateRecurringInput } from "~/modules/recurrings/types";

export default function RecurringEditPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: recurring, isLoading } = useRecurring(id!);
  const { mutate, isPending } = useUpdateRecurring();

  function handleSubmit(data: CreateRecurringInput) {
    mutate(
      {
        id: id!,
        data: {
          name: data.name,
          amount: data.amount,
          dayOfMonth: data.dayOfMonth,
          walletId: data.walletId,
          targetWalletId: data.targetWalletId,
          categoryId: data.categoryId,
        },
      },
      { onSuccess: () => navigate("/recurrings") },
    );
  }

  return (
    <section>
      <Header title="Edit Recurring" backHref="/recurrings" />
      <main className="p-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="grid w-full gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : recurring ? (
          <RecurringForm
            recurring={recurring}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/recurrings")}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Recurring tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}
