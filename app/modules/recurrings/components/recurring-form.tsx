import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { CategorySelect } from "~/components/shared/category-select";
import {
  createRecurringSchema,
  RecurringType,
  type CreateRecurringInput,
  type RecurringResponse,
} from "~/modules/recurrings/types";

interface RecurringFormProps {
  recurring?: RecurringResponse;
  onSubmit: (data: CreateRecurringInput) => void;
  isPending: boolean;
}

export function RecurringForm({
  recurring,
  onSubmit,
  isPending,
}: RecurringFormProps) {
  const form = useForm<CreateRecurringInput>({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: {
      name: recurring?.name ?? "",
      type: recurring?.type ?? RecurringType.EXPENSE,
      amount: recurring?.amount ?? 0,
      dayOfMonth: recurring?.dayOfMonth ?? 1,
      walletId: recurring?.wallet.id ?? "",
      targetWalletId: recurring?.targetWallet?.id ?? "",
      categoryId: recurring?.category?.id ?? "",
    },
    mode: "onChange",
  });

  const recurringType = form.watch("type");
  const walletId = form.watch("walletId");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Nama
        </label>
        <input
          id="name"
          {...form.register("name")}
          placeholder="Listrik"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {!recurring && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tipe
          </label>
          <div className="flex gap-2">
            {(
              [
                { value: RecurringType.EXPENSE, label: "Pengeluaran" },
                { value: RecurringType.TRANSFER, label: "Transfer" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  form.setValue("type", opt.value, { shouldValidate: true })
                }
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  recurringType === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          htmlFor="dayOfMonth"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Tanggal tiap Bulan
        </label>
        <input
          id="dayOfMonth"
          type="number"
          min={1}
          max={31}
          {...form.register("dayOfMonth", { valueAsNumber: true })}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {form.formState.errors.dayOfMonth && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.dayOfMonth.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="walletId"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {recurringType === RecurringType.TRANSFER
            ? "Dari Wallet"
            : "Wallet"}
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

      {recurringType === RecurringType.TRANSFER && (
        <div>
          <label
            htmlFor="targetWalletId"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Ke Wallet
          </label>
          <WalletSelect
            id="targetWalletId"
            value={form.watch("targetWalletId") ?? ""}
            onChange={(val) =>
              form.setValue("targetWalletId", val, { shouldValidate: true })
            }
            excludeId={walletId}
          />
          {form.formState.errors.targetWalletId && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.targetWalletId.message}
            </p>
          )}
        </div>
      )}

      {recurringType === RecurringType.EXPENSE && (
        <div>
          <label
            htmlFor="categoryId"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Kategori
          </label>
          <CategorySelect
            id="categoryId"
            type="EXPENSE"
            value={form.watch("categoryId") ?? ""}
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
      )}

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending
          ? "Menyimpan..."
          : recurring
            ? "Simpan Perubahan"
            : "Tambah Recurring"}
      </button>
    </form>
  );
}
