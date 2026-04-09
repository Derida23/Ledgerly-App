import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { DatePicker } from "~/components/shared/date-picker";
import { todayISO } from "~/lib/utils";
import {
  createTransferSchema,
  type CreateTransferInput,
} from "~/modules/transactions/types";

interface TransferFormProps {
  defaultValues?: Partial<CreateTransferInput>;
  onSubmit: (data: CreateTransferInput) => void;
  onCancel?: () => void;
  isPending: boolean;
}

export function TransferForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: TransferFormProps) {
  const form = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      amount: defaultValues?.amount ?? 0,
      sourceWalletId: defaultValues?.sourceWalletId ?? "",
      targetWalletId: defaultValues?.targetWalletId ?? "",
      adminFee: defaultValues?.adminFee ?? 0,
      date: defaultValues?.date ?? todayISO(),
      note: defaultValues?.note ?? "",
    },
    mode: "onChange",
  });

  const sourceWalletId = form.watch("sourceWalletId");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Jumlah Transfer
        </label>
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
          Biaya Admin (opsional)
        </label>
        <CurrencyInput
          value={form.watch("adminFee")}
          onValueChange={(val) =>
            form.setValue("adminFee", val, { shouldValidate: true })
          }
          placeholder="Rp 0"
        />
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Dari Wallet
        </label>
        <WalletSelect
          value={sourceWalletId}
          onChange={(val) =>
            form.setValue("sourceWalletId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.sourceWalletId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.sourceWalletId.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Ke Wallet
        </label>
        <WalletSelect
          value={form.watch("targetWalletId")}
          onChange={(val) =>
            form.setValue("targetWalletId", val, { shouldValidate: true })
          }
          excludeId={sourceWalletId}
        />
        {form.formState.errors.targetWalletId && (
          <p className="text-sm text-destructive">
            {form.formState.errors.targetWalletId.message}
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

      <fieldset className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-foreground">
          Catatan (opsional)
        </label>
        <textarea
          {...form.register("note")}
          placeholder="Transfer ke Jago..."
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
          {isPending ? "Memproses..." : "Transfer"}
        </Button>
      </div>
    </form>
  );
}
