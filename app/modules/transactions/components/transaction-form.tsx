import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { CategorySelect } from "~/components/shared/category-select";
import { todayISO } from "~/lib/utils";
import {
  createTransactionSchema,
  PaymentMethod,
  type CreateTransactionInput,
  type TransactionResponse,
} from "~/modules/transactions/types";

interface TransactionFormProps {
  type: "INCOME" | "EXPENSE";
  transaction?: TransactionResponse;
  defaultValues?: Partial<CreateTransactionInput>;
  onSubmit: (data: CreateTransactionInput) => void;
  isPending: boolean;
}

const METHOD_OPTIONS = [
  { value: PaymentMethod.CASH, label: "Cash" },
  { value: PaymentMethod.QRIS, label: "QRIS" },
  { value: PaymentMethod.TRANSFER, label: "Transfer" },
  { value: PaymentMethod.DEBIT, label: "Debit" },
] as const;

export function TransactionForm({
  type,
  transaction,
  defaultValues,
  onSubmit,
  isPending,
}: TransactionFormProps) {
  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: transaction?.amount ?? defaultValues?.amount ?? 0,
      type,
      walletId: transaction?.wallet.id ?? defaultValues?.walletId ?? "",
      categoryId: transaction?.category?.id ?? defaultValues?.categoryId ?? "",
      method:
        transaction?.method ?? defaultValues?.method ?? undefined,
      date:
        transaction?.date?.split("T")[0] ??
        defaultValues?.date ??
        todayISO(),
      note: transaction?.note ?? defaultValues?.note ?? "",
    },
    mode: "onChange",
  });

  const isExpense = type === "EXPENSE";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Jumlah
        </label>
        <CurrencyInput
          value={form.watch("amount")}
          onValueChange={(val) =>
            form.setValue("amount", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.amount && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="walletId"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Wallet
        </label>
        <WalletSelect
          id="walletId"
          value={form.watch("walletId")}
          onChange={(val) =>
            form.setValue("walletId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.walletId && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.walletId.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Kategori
        </label>
        <CategorySelect
          id="categoryId"
          type={type}
          value={form.watch("categoryId")}
          onChange={(val) =>
            form.setValue("categoryId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.categoryId && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.categoryId.message}
          </p>
        )}
      </div>

      {isExpense && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-2">
            {METHOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  form.setValue("method", opt.value, { shouldValidate: true })
                }
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  form.watch("method") === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.formState.errors.method && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.method.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="date"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Tanggal
        </label>
        <input
          id="date"
          type="date"
          {...form.register("date")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label
          htmlFor="note"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Catatan (opsional)
        </label>
        <input
          id="note"
          {...form.register("note")}
          placeholder="Makan siang..."
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending
          ? "Menyimpan..."
          : transaction
            ? "Simpan Perubahan"
            : "Tambah Transaksi"}
      </button>
    </form>
  );
}
