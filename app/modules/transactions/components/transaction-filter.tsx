import { WalletSelect } from "~/components/shared/wallet-select";
import { TransactionType } from "~/modules/transactions/types";
import type { TransactionFilters } from "~/modules/transactions/types";

interface TransactionFilterProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const TYPE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: TransactionType.INCOME, label: "Pemasukan" },
  { value: TransactionType.EXPENSE, label: "Pengeluaran" },
  { value: TransactionType.TRANSFER_OUT, label: "Transfer" },
] as const;

export function TransactionFilter({
  filters,
  onChange,
}: TransactionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={filters.type ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            type: (e.target.value || undefined) as TransactionFilters["type"],
            page: 1,
          })
        }
        className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="min-w-[140px]">
        <WalletSelect
          value={filters.walletId ?? ""}
          onChange={(val) =>
            onChange({ ...filters, walletId: val || undefined, page: 1 })
          }
          placeholder="Semua Wallet"
        />
      </div>

      <input
        type="date"
        value={filters.startDate ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            startDate: e.target.value || undefined,
            page: 1,
          })
        }
        placeholder="Dari"
        className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <input
        type="date"
        value={filters.endDate ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            endDate: e.target.value || undefined,
            page: 1,
          })
        }
        placeholder="Sampai"
        className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
