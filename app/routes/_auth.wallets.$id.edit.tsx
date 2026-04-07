import { useNavigate, useParams } from "react-router";
import { Header } from "~/components/layout/header";
import { WalletForm } from "~/modules/wallets/components";
import { useWallet, useUpdateWallet } from "~/modules/wallets/hooks";
import type { CreateWalletInput } from "~/modules/wallets/types";

export default function WalletEditPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: wallet, isLoading } = useWallet(id!);
  const { mutate, isPending } = useUpdateWallet();

  function handleSubmit(data: CreateWalletInput) {
    mutate(
      { id: id!, data },
      { onSuccess: () => navigate("/wallets") },
    );
  }

  return (
    <section>
      <Header title="Edit Wallet" backHref="/wallets" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : wallet ? (
          <WalletForm
            wallet={wallet}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Wallet tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}
