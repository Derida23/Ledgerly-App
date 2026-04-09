import { X } from "lucide-react";
import { WalletSelect } from "~/components/shared/wallet-select";
import { DatePicker } from "~/components/shared/date-picker";
import { TransactionType } from "~/modules/transactions/types";
import type { TransactionFilters } from "~/modules/transactions/types";
import { cn } from "~/lib/utils";

interface TransactionFilterProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const TYPE_CHIPS = [
  { value: "ALL", label: "Semua" },
  { value: TransactionType.INCOME, label: "Pemasukan" },
  { value: TransactionType.EXPENSE, label: "Pengeluaran" },
  { value: TransactionType.TRANSFER_OUT, label: "Transfer" },
] as const;

const DEFAULT_FILTERS: TransactionFilters = { page: 1 };

function hasActiveFilter(filters: TransactionFilters): boolean {
  return !!(filters.type || filters.walletId || filters.startDate || filters.endDate);
}

export function TransactionFilter({
  filters,
  onChange,
}: TransactionFilterProps) {
  const activeType = filters.type ?? "ALL";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  type: (chip.value === "ALL"
                    ? undefined
                    : chip.value) as TransactionFilters["type"],
                  page: 1,
                })
              }
              className={cn(
                "shrink-0 cursor-pointer rounded-xl px-4 py-2 text-xs font-medium shadow-sm transition-colors",
                activeType === chip.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {hasActiveFilter(filters) && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <WalletSelect
          value={filters.walletId ?? ""}
          onChange={(val) =>
            onChange({ ...filters, walletId: val || undefined, page: 1 })
          }
          placeholder="Semua Wallet"
          triggerClassName="h-9 text-xs"
        />
        <DatePicker
          value={filters.startDate}
          onChange={(val) =>
            onChange({ ...filters, startDate: val || undefined, page: 1 })
          }
          placeholder="Dari tanggal"
          className="h-9 text-xs"
        />
        <DatePicker
          value={filters.endDate}
          onChange={(val) =>
            onChange({ ...filters, endDate: val || undefined, page: 1 })
          }
          placeholder="Sampai tanggal"
          className="h-9 text-xs"
        />
      </div>
    </div>
  );
}
