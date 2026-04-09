import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useIsAdmin } from "~/modules/auth/hooks";
import { BudgetStatus } from "~/modules/budgets/types";
import type { BudgetResponse } from "~/modules/budgets/types";
import { ConfirmDialog } from "~/components/shared/confirm-dialog";
import { BudgetProgress } from "./budget-progress";

interface BudgetCardProps {
  budget: BudgetResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function BudgetCard({ budget, onDelete, isDeleting }: BudgetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isAdmin = useIsAdmin();

  return (
    <>
      <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate">
                {budget.name}
              </h3>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  budget.status === BudgetStatus.NORMAL &&
                    "bg-success/10 text-success",
                  budget.status === BudgetStatus.WARNING &&
                    "bg-warning/10 text-warning",
                  budget.status === BudgetStatus.OVER_BUDGET &&
                    "bg-destructive/10 text-destructive",
                )}
              >
                {budget.status === BudgetStatus.NORMAL && "Normal"}
                {budget.status === BudgetStatus.WARNING && "Warning"}
                {budget.status === BudgetStatus.OVER_BUDGET && "Over"}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-1 shrink-0 ml-2">
              <Link
                to={`/budgets/${budget.id}/edit`}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground"
                aria-label={`Edit ${budget.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/10 active:text-destructive"
                aria-label={`Hapus ${budget.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-3">
          <BudgetProgress
            spent={budget.spent}
            limit={budget.limit}
            status={budget.status}
          />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              Sembunyikan <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Lihat kategori <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
            {budget.categories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span role="img" aria-label={cat.name}>
                  {cat.icon}
                </span>
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </article>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => onDelete(budget.id)}
        title={`Hapus ${budget.name}?`}
        description="Budget yang dihapus tidak bisa dikembalikan."
        isPending={isDeleting}
      />
    </>
  );
}
