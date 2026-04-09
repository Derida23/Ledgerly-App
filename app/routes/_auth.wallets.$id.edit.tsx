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
      <main className="p-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="grid w-full gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : wallet ? (
          <WalletForm
            wallet={wallet}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/wallets")}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Wallet tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}
