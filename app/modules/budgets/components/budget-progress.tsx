import { cn, formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { BudgetStatus } from "~/modules/budgets/types";

interface BudgetProgressProps {
  spent: number;
  limit: number;
  status: BudgetStatus;
}

export function BudgetProgress({ spent, limit, status }: BudgetProgressProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const { isVisible } = useSaldoVisibility();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">
          {isVisible ? formatRupiah(spent) : "Rp ••••••••"}
        </span>
        <span className="text-muted-foreground">
          {isVisible ? formatRupiah(limit) : "Rp ••••••••"}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status === BudgetStatus.NORMAL && "bg-success",
            status === BudgetStatus.WARNING && "bg-warning",
            status === BudgetStatus.OVER_BUDGET && "bg-destructive",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% terpakai</span>
        <span>
          Sisa: {isVisible ? formatRupiah(limit - spent) : "Rp ••••••••"}
        </span>
      </div>
    </div>
  );
}
