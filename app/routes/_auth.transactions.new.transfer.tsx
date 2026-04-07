import { useNavigate, useSearchParams } from "react-router";
import { Header } from "~/components/layout/header";
import { TransferForm } from "~/modules/transactions/components";
import { useCreateTransfer } from "~/modules/transactions/hooks";
import type { CreateTransferInput } from "~/modules/transactions/types";

export default function TransferNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate, isPending } = useCreateTransfer();

  const defaultValues = {
    amount: Number(searchParams.get("amount")) || undefined,
    sourceWalletId: searchParams.get("sourceWalletId") ?? undefined,
    targetWalletId: searchParams.get("targetWalletId") ?? undefined,
    adminFee: Number(searchParams.get("adminFee")) || undefined,
    note: searchParams.get("note") ?? undefined,
  };

  function handleSubmit(data: CreateTransferInput) {
    mutate(data, {
      onSuccess: () => navigate("/transactions"),
    });
  }

  return (
    <section>
      <Header title="Transfer" backHref="/transactions" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        <TransferForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </main>
    </section>
  );
}
