import { lazy, Suspense } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Zap, ChevronRight, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn, formatRupiah } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { useIsAdmin } from "~/modules/auth/hooks";
import { Header } from "~/components/layout/header";
import { ModuleErrorBoundary } from "~/components/shared/error-boundary";
import { getDashboard } from "~/modules/reports/api";
import { getBudgets } from "~/modules/budgets/api";
import { getDueToday } from "~/modules/recurrings/api";
import { useMonthlyReport } from "~/modules/reports/hooks";
import { reportKeys } from "~/modules/reports/api/keys";
import { budgetKeys } from "~/modules/budgets/api/keys";
import { recurringKeys } from "~/modules/recurrings/api/keys";
import { BudgetStatus } from "~/modules/budgets/types";
import type { BudgetResponse } from "~/modules/budgets/types";
import type { RecurringResponse } from "~/modules/recurrings/types";
import type { WalletBalanceDto, MonthlyTrendDto } from "~/modules/reports/types";
import { RecurringType } from "~/modules/recurrings/types";

const TrendLineChart = lazy(() =>
  import("~/modules/reports/components/line-chart").then((m) => ({
    default: m.TrendLineChart,
  })),
);

const STALE = 10 * 60 * 1000;

export default function DashboardPage() {
  const { isVisible } = useSaldoVisibility();

  const dashboard = useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: getDashboard,
    staleTime: STALE,
  });

  const budgets = useQuery({
    queryKey: budgetKeys.list(),
    queryFn: getBudgets,
    staleTime: 5 * 60 * 1000,
  });

  const dueToday = useQuery({
    queryKey: recurringKeys.dueToday(),
    queryFn: getDueToday,
    staleTime: 60 * 60 * 1000,
  });

  const { data: monthlyReport } = useMonthlyReport();

  return (
    <section>
      <Header title="Dashboard" />
      <main className="space-y-5 p-4 pb-24 md:pb-4">
        {/* Total Balance — renders immediately with skeleton */}
        <ModuleErrorBoundary level="section">
          {dashboard.isLoading ? (
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
          ) : (
            <TotalBalanceCard
              balance={dashboard.data?.totalBalance ?? 0}
              isVisible={isVisible}
            />
          )}
        </ModuleErrorBoundary>

        {/* Wallet Cards — renders independently */}
        <ModuleErrorBoundary level="section">
          {dashboard.isLoading ? (
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 w-35 shrink-0 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <WalletCards wallets={dashboard.data?.wallets ?? []} isVisible={isVisible} />
          )}
        </ModuleErrorBoundary>

        {/* Due Today — renders independently */}
        <ModuleErrorBoundary level="section">
          {dueToday.isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : dueToday.data && dueToday.data.length > 0 ? (
            <DueTodaySection items={dueToday.data} isVisible={isVisible} />
          ) : null}
        </ModuleErrorBoundary>

        {/* Budget — renders independently */}
        <ModuleErrorBoundary level="section">
          {budgets.isLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          ) : budgets.data && budgets.data.length > 0 ? (
            <BudgetSection budgets={budgets.data} isVisible={isVisible} />
          ) : null}
        </ModuleErrorBoundary>

        {/* Monthly Summary — renders independently */}
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

        {/* Trend Chart — lazy loaded, renders last */}
        {dashboard.data?.monthlyTrend && dashboard.data.monthlyTrend.length > 0 && (
          <ModuleErrorBoundary level="section">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tren 12 Bulan</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
                  <TrendLineChart data={dashboard.data.monthlyTrend} />
                </Suspense>
              </CardContent>
            </Card>
          </ModuleErrorBoundary>
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
    <div className="rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent shadow-sm px-4 py-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">Total Saldo</p>
      <p className="mt-1 text-3xl font-bold text-foreground tabular-nums">
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
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      {wallets.map((w) => (
        <Link key={w.id} to={`/wallets/${w.id}`} className="group">
          <Card className="min-w-35 shrink-0 transition-colors group-hover:bg-accent/30">
            <CardContent className="p-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mb-2">
                <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs text-muted-foreground truncate">{w.name}</p>
              <p className="mt-0.5 text-sm font-bold text-foreground tabular-nums">
                {isVisible ? formatRupiah(w.balance) : "••••"}
              </p>
            </CardContent>
          </Card>
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
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
          Recurring Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((r) => {
          const isTransfer = r.type === RecurringType.TRANSFER;
          const payUrl = isTransfer
            ? `/transactions/new/transfer?sourceWalletId=${r.wallet.id}&targetWalletId=${r.targetWallet?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`
            : `/transactions/new?type=expense&walletId=${r.wallet.id}&categoryId=${r.category?.id ?? ""}&amount=${r.amount}&note=${encodeURIComponent(r.name)}`;

          return (
            <div key={r.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg shrink-0">
                  {r.category?.icon ?? "🔄"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {isVisible ? formatRupiah(r.amount) : "Rp ••••••••"}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Link
                  to={payUrl}
                  className="inline-flex shrink-0 h-7 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Bayar
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
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
          className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          Lihat semua <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {budgets.map((b) => {
        const pct = Math.min((b.spent / b.limit) * 100, 100);
        return (
          <Card key={b.id}>
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {b.name}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
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
              <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                {isVisible
                  ? `${formatRupiah(b.spent)} / ${formatRupiah(b.limit)}`
                  : "•••• / ••••"}
              </p>
            </CardContent>
          </Card>
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-[10px] text-muted-foreground">Pemasukan</p>
            <p className="mt-0.5 text-sm font-bold text-success tabular-nums">
              {isVisible ? formatRupiah(income) : "••••"}
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
            <p className="mt-0.5 text-sm font-bold text-destructive tabular-nums">
              {isVisible ? formatRupiah(expense) : "••••"}
            </p>
          </div>
          <div className="text-center">
            <div
              className={cn(
                "mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg",
                balance >= 0 ? "bg-success/10" : "bg-destructive/10",
              )}
            >
              <ArrowUpDown
                className={cn(
                  "h-4 w-4",
                  balance >= 0 ? "text-success" : "text-destructive",
                )}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {balance >= 0 ? "Surplus" : "Defisit"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-bold tabular-nums",
                balance >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {isVisible ? formatRupiah(Math.abs(balance)) : "••••"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
