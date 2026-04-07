import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "~/components/shared/currency-input";
import { WalletSelect } from "~/components/shared/wallet-select";
import { todayISO } from "~/lib/utils";
import {
  createTransferSchema,
  type CreateTransferInput,
} from "~/modules/transactions/types";

interface TransferFormProps {
  defaultValues?: Partial<CreateTransferInput>;
  onSubmit: (data: CreateTransferInput) => void;
  isPending: boolean;
}

export function TransferForm({
  defaultValues,
  onSubmit,
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Jumlah Transfer
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
          htmlFor="sourceWalletId"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Dari Wallet
        </label>
        <WalletSelect
          id="sourceWalletId"
          value={sourceWalletId}
          onChange={(val) =>
            form.setValue("sourceWalletId", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.sourceWalletId && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.sourceWalletId.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="targetWalletId"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Ke Wallet
        </label>
        <WalletSelect
          id="targetWalletId"
          value={form.watch("targetWalletId")}
          onChange={(val) =>
            form.setValue("targetWalletId", val, { shouldValidate: true })
          }
          excludeId={sourceWalletId}
        />
        {form.formState.errors.targetWalletId && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.targetWalletId.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Biaya Admin (opsional)
        </label>
        <CurrencyInput
          value={form.watch("adminFee")}
          onValueChange={(val) =>
            form.setValue("adminFee", val, { shouldValidate: true })
          }
          placeholder="Rp 0"
        />
      </div>

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
          placeholder="Transfer ke Jago..."
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Memproses..." : "Transfer"}
      </button>
    </form>
  );
}
