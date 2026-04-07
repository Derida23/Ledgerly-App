import { useNavigate } from "react-router";
import { Header } from "~/components/layout/header";
import { RecurringForm } from "~/modules/recurrings/components";
import { useCreateRecurring } from "~/modules/recurrings/hooks";
import type { CreateRecurringInput } from "~/modules/recurrings/types";

export default function RecurringNewPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateRecurring();

  function handleSubmit(data: CreateRecurringInput) {
    mutate(data, {
      onSuccess: () => navigate("/recurrings"),
    });
  }

  return (
    <section>
      <Header title="Tambah Recurring" backHref="/recurrings" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        <RecurringForm onSubmit={handleSubmit} isPending={isPending} />
      </main>
    </section>
  );
}
