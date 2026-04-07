import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
import { cn, formatRupiah, formatDate } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useIsAdmin } from "~/modules/auth/hooks";
import {
  useTransactions,
  useDeleteTransaction,
} from "~/modules/transactions/hooks";
import { TransactionType } from "~/modules/transactions/types";
import type {
  TransactionFilters,
  TransactionResponse,
} from "~/modules/transactions/types";
import { ConfirmDialog } from "~/components/shared/confirm-dialog";
import { EmptyState } from "~/components/shared/empty-state";
import { TransactionFilter } from "./transaction-filter";

export function TransactionList({
  initialFilters,
}: {
  initialFilters?: Partial<TransactionFilters>;
}) {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const { data, isLoading, isError, error, refetch } =
    useTransactions(filters);
  const deleteMutation = useDeleteTransaction();
  const isAdmin = useIsAdmin();
  const { isVisible } = useSaldoVisibility();

  return (
    <div className="space-y-4">
      <TransactionFilter filters={filters} onChange={setFilters} />

      {isLoading ? (
        <TransactionListSkeleton />
      ) : isError ? (
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
      ) : !data?.data.length ? (
        <EmptyState icon={ArrowLeftRight} message="Belum ada transaksi" />
      ) : (
        <>
          <TransactionGroupedList
            transactions={data.data}
            isAdmin={isAdmin}
            isVisible={isVisible}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />

          {data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          )}
        </>
      )}
    </div>
  );
}

function TransactionGroupedList({
  transactions,
  isAdmin,
  isVisible,
  onDelete,
  isDeleting,
}: {
  transactions: TransactionResponse[];
  isAdmin: boolean;
  isVisible: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-4">
      {grouped.map(([dateKey, items]) => (
        <section key={dateKey}>
          <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            {formatDate(dateKey, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <ul className="space-y-1 rounded-xl border border-border bg-card">
            {items.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                isAdmin={isAdmin}
                isVisible={isVisible}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TransactionItem({
  transaction: tx,
  isAdmin,
  isVisible,
  onDelete,
  isDeleting,
}: {
  transaction: TransactionResponse;
  isAdmin: boolean;
  isVisible: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isIncome =
    tx.type === TransactionType.INCOME ||
    tx.type === TransactionType.TRANSFER_IN;
  const isTransfer =
    tx.type === TransactionType.TRANSFER_IN ||
    tx.type === TransactionType.TRANSFER_OUT;

  const amountDisplay = isVisible
    ? `${isIncome ? "+" : "-"}${formatRupiah(tx.amount)}`
    : "Rp ••••••••";

  return (
    <>
      <li className="group flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0" role="img" aria-label={tx.category?.name ?? "Transfer"}>
            {tx.category?.icon ?? "🔄"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {tx.category?.name ?? "Transfer"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {tx.wallet.name}
              {tx.method && ` • ${tx.method}`}
              {tx.note && ` • ${tx.note}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-sm font-semibold",
              isIncome && "text-success",
              !isIncome && !isTransfer && "text-destructive",
              isTransfer && "text-muted-foreground",
            )}
          >
            {amountDisplay}
          </span>

          {isAdmin && (
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Link
                to={`/transactions/${tx.id}/edit`}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                aria-label="Hapus"
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
        onConfirm={() => onDelete(tx.id)}
        title="Hapus transaksi ini?"
        description="Transaksi yang dihapus tidak bisa dikembalikan."
        isPending={isDeleting}
      />
    </>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi} className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="rounded-xl border border-border bg-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(
  transactions: TransactionResponse[],
): [string, TransactionResponse[]][] {
  const map = new Map<string, TransactionResponse[]>();
  for (const tx of transactions) {
    const dateKey = tx.date.split("T")[0]!;
    const existing = map.get(dateKey);
    if (existing) {
      existing.push(tx);
    } else {
      map.set(dateKey, [tx]);
    }
  }
  return Array.from(map.entries());
}
