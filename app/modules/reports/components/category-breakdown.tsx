import { formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import type { CategoryBreakdownDto } from "~/modules/reports/types";

interface CategoryBreakdownProps {
  data: CategoryBreakdownDto[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const { isVisible } = useSaldoVisibility();

  if (!data.length) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Breakdown Kategori
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Kategori</th>
              <th className="pb-2 text-right font-medium">Total</th>
              <th className="pb-2 text-right font-medium">Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.categoryId}
                className="border-b border-border last:border-0"
              >
                <td className="py-2.5">
                  <span role="img" aria-label={item.categoryName}>
                    {item.categoryIcon}
                  </span>{" "}
                  {item.categoryName}
                </td>
                <td className="py-2.5 text-right font-medium">
                  {isVisible ? formatRupiah(item.total) : "Rp ••••••••"}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {item.count}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
