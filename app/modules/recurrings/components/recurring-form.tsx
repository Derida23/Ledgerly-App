import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { CategorySelect } from "~/components/shared/category-select";
import { cn } from "~/lib/utils";
import {
  createRecurringSchema,
  RecurringType,
  type CreateRecurringInput,
  type RecurringResponse,
} from "~/modules/recurrings/types";

interface RecurringFormProps {
  recurring?: RecurringResponse;
  onSubmit: (data: CreateRecurringInput) => void;
  onCancel?: () => void;
  isPending: boolean;
}

export function RecurringForm({
  recurring,
  onSubmit,
  onCancel,
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nama</label>
        <Input
          {...form.register("name")}
          placeholder="Listrik"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </fieldset>

      {!recurring && (
        <fieldset className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipe</label>
          <div className="grid grid-cols-2 gap-2">
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
                className={cn(
                  "h-10 cursor-pointer rounded-lg border text-sm font-medium transition-colors",
                  recurringType === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

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
        <label className="text-sm font-medium text-foreground">
          Tanggal tiap Bulan
        </label>
        <Input
          type="number"
          min={1}
          max={31}
          {...form.register("dayOfMonth", { valueAsNumber: true })}
        />
        {form.formState.errors.dayOfMonth && (
          <p className="text-sm text-destructive">
            {form.formState.errors.dayOfMonth.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {recurringType === RecurringType.TRANSFER ? "Dari Wallet" : "Wallet"}
        </label>
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

      {recurringType === RecurringType.TRANSFER && (
        <fieldset className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ke Wallet
          </label>
          <WalletSelect
            value={form.watch("targetWalletId") ?? ""}
            onChange={(val) =>
              form.setValue("targetWalletId", val, { shouldValidate: true })
            }
            excludeId={walletId}
          />
          {form.formState.errors.targetWalletId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.targetWalletId.message}
            </p>
          )}
        </fieldset>
      )}

      {recurringType === RecurringType.EXPENSE && (
        <fieldset className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Kategori
          </label>
          <CategorySelect
            type="EXPENSE"
            value={form.watch("categoryId") ?? ""}
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
      )}

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
            : recurring
              ? "Simpan Perubahan"
              : "Tambah Recurring"}
        </Button>
      </div>
    </form>
  );
}
