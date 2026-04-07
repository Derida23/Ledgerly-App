import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Trash2, Wallet as WalletIcon } from "lucide-react";
import { cn, formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useIsAdmin } from "~/modules/auth/hooks";
import { ConfirmDialog } from "~/components/shared/confirm-dialog";
import type { WalletResponse } from "~/modules/wallets/types";

interface WalletCardProps {
  wallet: WalletResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function WalletCard({ wallet, onDelete, isDeleting }: WalletCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { isVisible } = useSaldoVisibility();
  const isAdmin = useIsAdmin();

  return (
    <>
      <article className="group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50">
        <Link to={`/wallets/${wallet.id}`} className="block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <WalletIcon
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {wallet.name}
              </p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  wallet.balance >= 0 ? "text-success" : "text-destructive",
                )}
                aria-label={isVisible ? formatRupiah(wallet.balance) : "Saldo tersembunyi"}
              >
                {isVisible ? formatRupiah(wallet.balance) : "Rp ••••••••"}
              </p>
            </div>
          </div>
        </Link>

        {isAdmin && (
          <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Link
              to={`/wallets/${wallet.id}/edit`}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Edit ${wallet.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Hapus ${wallet.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => onDelete(wallet.id)}
        title={`Hapus ${wallet.name}?`}
        description="Wallet yang masih memiliki transaksi tidak bisa dihapus."
        isPending={isDeleting}
      />
    </>
  );
}
