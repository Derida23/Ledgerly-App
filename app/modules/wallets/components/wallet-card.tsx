import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Trash2, Wallet as WalletIcon } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
      <Card className="group relative p-4 transition-colors active:bg-accent/30">
        <Link to={`/wallets/${wallet.id}`} className="block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <WalletIcon
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {wallet.name}
              </p>
              <p
                className={cn(
                  "text-lg font-bold tabular-nums",
                  wallet.balance >= 0 ? "text-foreground" : "text-destructive",
                )}
                aria-label={
                  isVisible
                    ? formatRupiah(wallet.balance)
                    : "Saldo tersembunyi"
                }
              >
                {isVisible ? formatRupiah(wallet.balance) : "Rp ••••••••"}
              </p>
            </div>
          </div>
        </Link>

        {isAdmin && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5">
            <Link
              to={`/wallets/${wallet.id}/edit`}
              aria-label={`Edit ${wallet.name}`}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive active:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              aria-label={`Hapus ${wallet.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </Card>

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
