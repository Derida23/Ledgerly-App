import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Trash2, RefreshCw, Zap } from "lucide-react";
import { formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useIsAdmin } from "~/modules/auth/hooks";
import {
  useRecurrings,
  useDueToday,
  useDeleteRecurring,
} from "~/modules/recurrings/hooks";
import { RecurringType } from "~/modules/recurrings/types";
import type { RecurringResponse } from "~/modules/recurrings/types";
import { ConfirmDialog } from "~/components/shared/confirm-dialog";
import { EmptyState } from "~/components/shared/empty-state";

export function RecurringList() {
  const { data: recurrings, isLoading, isError, error, refetch } =
    useRecurrings();
  const { data: dueToday } = useDueToday();
  const deleteMutation = useDeleteRecurring();
  const isAdmin = useIsAdmin();
  const { isVisible } = useSaldoVisibility();

  if (isLoading) return <RecurringListSkeleton />;

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

  if (!recurrings?.length) {
    return <EmptyState icon={RefreshCw} message="Belum ada recurring" />;
  }

  const dueTodayIds = new Set(dueToday?.map((r) => r.id) ?? []);

  return (
    <div className="space-y-6">
      {dueToday && dueToday.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
            Due Hari Ini
          </h2>
          <ul className="space-y-2">
            {dueToday.map((r) => (
              <RecurringItem
                key={r.id}
                recurring={r}
                isDue
                isAdmin={isAdmin}
                isVisible={isVisible}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Semua Recurring
        </h2>
        <ul className="space-y-2">
          {recurrings.map((r) => (
            <RecurringItem
              key={r.id}
              recurring={r}
              isDue={dueTodayIds.has(r.id)}
              isAdmin={isAdmin}
              isVisible={isVisible}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function RecurringItem({
  recurring: r,
  isDue,
  isAdmin,
  isVisible,
  onDelete,
  isDeleting,
}: {
  recurring: RecurringResponse;
  isDue: boolean;
  isAdmin: boolean;
  isVisible: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isTransfer = r.type === RecurringType.TRANSFER;
  const payUrl = isTransfer
    ? `/transactions/new/transfer?sourceWalletId=${r.wallet.id}&targetWalletId=${r.targetWallet?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`
    : `/transactions/new?type=expense&walletId=${r.wallet.id}&categoryId=${r.category?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`;

  return (
    <>
      <li className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0" role="img" aria-label={r.name}>
            {r.category?.icon ?? "🔄"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {r.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {r.wallet.name}
              {r.targetWallet && ` → ${r.targetWallet.name}`}
              {" • "}Tgl {r.dayOfMonth}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-foreground">
            {isVisible ? formatRupiah(r.amount) : "Rp ••••••••"}
          </span>

          {isAdmin && isDue && (
            <Link
              to={payUrl}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Bayar
            </Link>
          )}

          {isAdmin && (
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Link
                to={`/recurrings/${r.id}/edit`}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={`Edit ${r.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                aria-label={`Hapus ${r.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </li>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => onDelete(r.id)}
        title={`Hapus ${r.name}?`}
        description="Recurring yang dihapus tidak bisa dikembalikan."
        isPending={isDeleting}
      />
    </>
  );
}

function RecurringListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
