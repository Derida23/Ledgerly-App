import { Link, useParams } from "react-router";
import { ArrowLeftRight, Wallet as WalletIcon } from "lucide-react";
import { Header } from "~/components/layout/header";
import { formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useWallet } from "~/modules/wallets/hooks";

export default function WalletDetailPage() {
  const { id } = useParams<"id">();
  const { data: wallet, isLoading } = useWallet(id!);
  const { isVisible } = useSaldoVisibility();

  return (
    <section>
      <Header title={wallet?.name ?? "Detail Wallet"} backHref="/wallets" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : wallet ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <WalletIcon className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">{wallet.name}</p>
              <p className="mt-1 text-3xl font-bold text-foreground">
                {isVisible ? formatRupiah(wallet.balance) : "Rp ••••••••"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Saldo awal: {isVisible ? formatRupiah(wallet.initialBalance) : "Rp ••••••••"}
              </p>
            </div>

            <Link
              to={`/transactions?walletId=${wallet.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Lihat Transaksi
            </Link>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Wallet tidak ditemukan
          </p>
        )}
      </main>
    </section>
  );
}
