import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { CategorySelect } from "~/components/shared/category-select";
import { DatePicker } from "~/components/shared/date-picker";
import { cn, todayISO } from "~/lib/utils";
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
  onCancel?: () => void;
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
  onCancel,
  isPending,
}: TransactionFormProps) {
  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: transaction?.amount ?? defaultValues?.amount ?? 0,
      type,
      walletId: transaction?.wallet.id ?? defaultValues?.walletId ?? "",
      categoryId: transaction?.category?.id ?? defaultValues?.categoryId ?? "",
      method: transaction?.method ?? defaultValues?.method ?? undefined,
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">Jumlah</label>
        <CurrencyInput
          value={form.watch("amount")}
          onValueChange={(val) =>
            form.setValue("amount", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive">
            {form.formState.errors.amount.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">Wallet</label>
        <WalletSelect
          value={form.watch("walletId")}
          onChange={(val) =>
            form.setValue("walletId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.walletId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.walletId.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">Kategori</label>
        <CategorySelect
          type={type}
          value={form.watch("categoryId")}
          onChange={(val) =>
            form.setValue("categoryId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.categoryId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.categoryId.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tanggal</label>
        <DatePicker
          value={form.watch("date")}
          onChange={(val) =>
            form.setValue("date", val, { shouldValidate: true })
          }
        />
      </fieldset>

      {isExpense && (
        <fieldset className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-4 gap-2">
            {METHOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  form.setValue("method", opt.value, { shouldValidate: true })
                }
                className={cn(
                  "h-10 cursor-pointer rounded-lg border text-sm font-medium transition-colors",
                  form.watch("method") === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.formState.errors.method && (
            <p className="text-sm text-destructive">
              {form.formState.errors.method.message}
            </p>
          )}
        </fieldset>
      )}

      <fieldset className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-foreground">
          Catatan (opsional)
        </label>
        <textarea
          {...form.register("note")}
          placeholder="Makan siang..."
          rows={3}
          className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:border-ring resize-none"
        />
      </fieldset>

      <div className="md:col-span-2 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" className="w-full md:w-auto md:min-w-32" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          type="submit"
          className="w-full md:w-auto md:min-w-48"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending
            ? "Menyimpan..."
            : transaction
              ? "Simpan Perubahan"
              : "Tambah Transaksi"}
        </Button>
      </div>
    </form>
  );
}
