import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useWallets } from "~/modules/wallets/hooks";

interface WalletSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeId?: string;
  triggerClassName?: string;
}

export function WalletSelect({
  value,
  onChange,
  placeholder = "Pilih wallet",
  excludeId,
  triggerClassName,
}: WalletSelectProps) {
  const { data: wallets, isLoading } = useWallets();

  const filteredWallets = excludeId
    ? wallets?.filter((w) => w.id !== excludeId)
    : wallets;

  const isEmpty = !isLoading && (!filteredWallets || filteredWallets.length === 0);
  const selectedWallet = filteredWallets?.find((w) => w.id === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")} disabled={isLoading || isEmpty}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue
          placeholder={
            isLoading
              ? "Memuat..."
              : isEmpty
                ? "Belum ada wallet"
                : placeholder
          }
        >
          {selectedWallet ? selectedWallet.name : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {isEmpty ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Belum ada wallet
          </div>
        ) : (
          filteredWallets?.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id}>
              {wallet.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
