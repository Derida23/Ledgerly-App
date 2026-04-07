import { Link } from "react-router";
import { Wallet, Zap, ChevronRight } from "lucide-react";
import { cn, formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useIsAdmin } from "~/modules/auth/hooks";
import { Header } from "~/components/layout/header";
import { ModuleErrorBoundary } from "~/components/shared/error-boundary";
import { useDashboardData } from "~/modules/reports/hooks";
import { useMonthlyReport } from "~/modules/reports/hooks";
import { BudgetStatus } from "~/modules/budgets/types";
import type { BudgetResponse } from "~/modules/budgets/types";
import type { RecurringResponse } from "~/modules/recurrings/types";
import type { WalletBalanceDto } from "~/modules/reports/types";
import { RecurringType } from "~/modules/recurrings/types";
import { TrendLineChart } from "~/modules/reports/components";

export default function DashboardPage() {
  const { dashboard, budgets, dueToday, isLoading } = useDashboardData();
  const { data: monthlyReport } = useMonthlyReport();
  const { isVisible } = useSaldoVisibility();

  return (
    <section>
      <Header title="Dashboard" />
      <main className="space-y-4 p-4 pb-20 md:pb-4">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <ModuleErrorBoundary level="section">
              <TotalBalanceCard
                balance={dashboard?.totalBalance ?? 0}
                isVisible={isVisible}
              />
            </ModuleErrorBoundary>

            <ModuleErrorBoundary level="section">
              <WalletCards
                wallets={dashboard?.wallets ?? []}
                isVisible={isVisible}
              />
            </ModuleErrorBoundary>

            {dueToday && dueToday.length > 0 && (
              <ModuleErrorBoundary level="section">
                <DueTodaySection items={dueToday} isVisible={isVisible} />
              </ModuleErrorBoundary>
            )}

            {budgets && budgets.length > 0 && (
              <ModuleErrorBoundary level="section">
                <BudgetSection budgets={budgets} isVisible={isVisible} />
              </ModuleErrorBoundary>
            )}

            {monthlyReport && (
              <ModuleErrorBoundary level="section">
                <MonthlySummary
                  income={monthlyReport.totalIncome}
                  expense={monthlyReport.totalExpense}
                  balance={monthlyReport.balance}
                  isVisible={isVisible}
                />
              </ModuleErrorBoundary>
            )}

            {dashboard?.monthlyTrend && dashboard.monthlyTrend.length > 0 && (
              <ModuleErrorBoundary level="section">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">
                    Tren 12 Bulan
                  </h2>
                  <TrendLineChart data={dashboard.monthlyTrend} />
                </div>
              </ModuleErrorBoundary>
            )}
          </>
        )}
      </main>
    </section>
  );
}

function TotalBalanceCard({
  balance,
  isVisible,
}: {
  balance: number;
  isVisible: boolean;
}) {
  return (
    <div className="rounded-xl bg-primary/10 p-5 text-center">
      <p className="text-sm text-muted-foreground">Total Saldo</p>
      <p className="mt-1 text-3xl font-bold text-foreground">
        {isVisible ? formatRupiah(balance) : "Rp ••••••••"}
      </p>
    </div>
  );
}

function WalletCards({
  wallets,
  isVisible,
}: {
  wallets: WalletBalanceDto[];
  isVisible: boolean;
}) {
  if (!wallets.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
      {wallets.map((w) => (
        <Link
          key={w.id}
          to={`/wallets/${w.id}`}
          className="flex min-w-35 shrink-0 flex-col rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-accent/50"
        >
          <Wallet
            className="mb-1.5 h-4 w-4 text-primary"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground truncate">{w.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {isVisible ? formatRupiah(w.balance) : "••••"}
          </p>
        </Link>
      ))}
    </div>
  );
}

function DueTodaySection({
  items,
  isVisible,
}: {
  items: RecurringResponse[];
  isVisible: boolean;
}) {
  const isAdmin = useIsAdmin();

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
        Recurring Hari Ini
      </h2>
      <ul className="space-y-2">
        {items.map((r) => {
          const isTransfer = r.type === RecurringType.TRANSFER;
          const payUrl = isTransfer
            ? `/transactions/new/transfer?sourceWalletId=${r.wallet.id}&targetWalletId=${r.targetWallet?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`
            : `/transactions/new?type=expense&walletId=${r.wallet.id}&categoryId=${r.category?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`;

          return (
            <li
              key={r.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">
                  {r.category?.icon ?? "🔄"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isVisible ? formatRupiah(r.amount) : "Rp ••••••••"}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  to={payUrl}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Bayar
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BudgetSection({
  budgets,
  isVisible,
}: {
  budgets: BudgetResponse[];
  isVisible: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Budget</h2>
        <Link
          to="/budgets"
          className="flex items-center gap-0.5 text-xs text-primary"
        >
          Lihat semua <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {budgets.map((b) => {
        const pct = Math.min((b.spent / b.limit) * 100, 100);
        return (
          <div key={b.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {b.name}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  b.status === BudgetStatus.NORMAL && "text-success",
                  b.status === BudgetStatus.WARNING && "text-warning",
                  b.status === BudgetStatus.OVER_BUDGET && "text-destructive",
                )}
              >
                {Math.round(pct)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  b.status === BudgetStatus.NORMAL && "bg-success",
                  b.status === BudgetStatus.WARNING && "bg-warning",
                  b.status === BudgetStatus.OVER_BUDGET && "bg-destructive",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isVisible
                ? `${formatRupiah(b.spent)} / ${formatRupiah(b.limit)}`
                : "•••• / ••••"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MonthlySummary({
  income,
  expense,
  balance,
  isVisible,
}: {
  income: number;
  expense: number;
  balance: number;
  isVisible: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Bulan Ini</h2>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Pemasukan</p>
          <p className="mt-0.5 text-sm font-bold text-success">
            {isVisible ? formatRupiah(income) : "••••"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
          <p className="mt-0.5 text-sm font-bold text-destructive">
            {isVisible ? formatRupiah(expense) : "••••"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">
            {balance >= 0 ? "Surplus" : "Defisit"}
          </p>
          <p
            className={cn(
              "mt-0.5 text-sm font-bold",
              balance >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {isVisible ? formatRupiah(Math.abs(balance)) : "••••"}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 w-36 shrink-0 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
