import { useWallets } from "~/modules/wallets/hooks";

interface WalletSelectProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  excludeId?: string;
}

export function WalletSelect({
  value,
  onChange,
  id,
  placeholder = "Pilih wallet",
  excludeId,
}: WalletSelectProps) {
  const { data: wallets, isLoading } = useWallets();

  const filteredWallets = excludeId
    ? wallets?.filter((w) => w.id !== excludeId)
    : wallets;

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      disabled={isLoading}
    >
      <option value="">{isLoading ? "Memuat..." : placeholder}</option>
      {filteredWallets?.map((wallet) => (
        <option key={wallet.id} value={wallet.id}>
          {wallet.name}
        </option>
      ))}
    </select>
  );
}
