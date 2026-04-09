import { useNavigate } from "react-router";
import { Header } from "~/components/layout/header";
import { WalletForm } from "~/modules/wallets/components";
import { useCreateWallet } from "~/modules/wallets/hooks";
import type { CreateWalletInput } from "~/modules/wallets/types";

export default function WalletNewPage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateWallet();

  function handleSubmit(data: CreateWalletInput) {
    mutate(data, {
      onSuccess: () => navigate("/wallets"),
    });
  }

  return (
    <section>
      <Header title="Tambah Wallet" backHref="/wallets" />
      <main className="p-4 pb-24 md:pb-4">
        <WalletForm onSubmit={handleSubmit} onCancel={() => navigate("/wallets")} isPending={isPending} />
      </main>
    </section>
  );
}
