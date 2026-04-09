import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CurrencyInput } from "~/components/shared/currency-input";
import {
  createWalletSchema,
  type CreateWalletInput,
  type WalletResponse,
} from "~/modules/wallets/types";

interface WalletFormProps {
  wallet?: WalletResponse;
  onSubmit: (data: CreateWalletInput) => void;
  onCancel?: () => void;
  isPending: boolean;
}

export function WalletForm({ wallet, onSubmit, onCancel, isPending }: WalletFormProps) {
  const form = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: wallet?.name ?? "",
      initialBalance: wallet?.initialBalance ?? 0,
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-foreground"
        >
          Nama Wallet
        </label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Bank Mandiri"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-2">
        <label
          htmlFor="initialBalance"
          className="text-sm font-medium text-foreground"
        >
          Saldo Awal
        </label>
        <CurrencyInput
          id="initialBalance"
          value={form.watch("initialBalance")}
          onValueChange={(val) =>
            form.setValue("initialBalance", val, { shouldValidate: true })
          }
        />
        {form.formState.errors.initialBalance && (
          <p className="text-sm text-destructive">
            {form.formState.errors.initialBalance.message}
          </p>
        )}
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
            : wallet
              ? "Simpan Perubahan"
              : "Tambah Wallet"}
        </Button>
      </div>
    </form>
  );
}
