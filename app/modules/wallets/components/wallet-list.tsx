import { Wallet as WalletIcon } from "lucide-react";
import { formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useWallets, useDeleteWallet } from "~/modules/wallets/hooks";
import { EmptyState } from "~/components/shared/empty-state";
import { WalletCard } from "./wallet-card";

export function WalletList() {
  const { data: wallets, isLoading, isError, error, refetch } = useWallets();
  const deleteMutation = useDeleteWallet();
  const { isVisible } = useSaldoVisibility();

  if (isLoading) {
    return <WalletListSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
        <p className="font-medium">Gagal memuat data</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!wallets?.length) {
    return <EmptyState icon={WalletIcon} message="Belum ada wallet" />;
  }

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-primary/10 p-4 text-center">
        <p className="text-sm text-muted-foreground">Total Saldo</p>
        <p className="text-2xl font-bold text-foreground">
          {isVisible ? formatRupiah(totalBalance) : "Rp ••••••••"}
        </p>
      </div>

      <ul className="space-y-3">
        {wallets.map((wallet) => (
          <li key={wallet.id}>
            <WalletCard
              wallet={wallet}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function WalletListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
