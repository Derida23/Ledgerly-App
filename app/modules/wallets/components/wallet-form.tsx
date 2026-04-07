import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencyInput } from "~/components/shared/currency-input";
import {
  createWalletSchema,
  type CreateWalletInput,
  type WalletResponse,
} from "~/modules/wallets/types";

interface WalletFormProps {
  wallet?: WalletResponse;
  onSubmit: (data: CreateWalletInput) => void;
  isPending: boolean;
}

export function WalletForm({ wallet, onSubmit, isPending }: WalletFormProps) {
  const form = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: wallet?.name ?? "",
      initialBalance: wallet?.initialBalance ?? 0,
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Nama Wallet
        </label>
        <input
          id="name"
          {...form.register("name")}
          placeholder="Bank Mandiri"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="initialBalance"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Saldo Awal
        </label>
        <CurrencyInput
          id="initialBalance"
          value={form.watch("initialBalance")}
          onValueChange={(val) => form.setValue("initialBalance", val, { shouldValidate: true })}
        />
        {form.formState.errors.initialBalance && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.initialBalance.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : wallet ? "Simpan Perubahan" : "Tambah Wallet"}
      </button>
    </form>
  );
}
