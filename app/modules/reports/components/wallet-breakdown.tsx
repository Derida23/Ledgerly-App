import { formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import type { WalletBreakdownDto } from "~/modules/reports/types";

interface WalletBreakdownProps {
  data: WalletBreakdownDto[];
}

export function WalletBreakdown({ data }: WalletBreakdownProps) {
  const { isVisible } = useSaldoVisibility();

  if (!data.length) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Breakdown Wallet
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Wallet</th>
              <th className="pb-2 text-right font-medium">Pemasukan</th>
              <th className="pb-2 text-right font-medium">Pengeluaran</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.walletId}
                className="border-b border-border last:border-0"
              >
                <td className="py-2.5">{item.walletName}</td>
                <td className="py-2.5 text-right font-medium text-success">
                  {isVisible ? formatRupiah(item.totalIncome) : "Rp ••••••••"}
                </td>
                <td className="py-2.5 text-right font-medium text-destructive">
                  {isVisible ? formatRupiah(item.totalExpense) : "Rp ••••••••"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
