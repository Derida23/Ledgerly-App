import { lazy, Suspense, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { cn, formatRupiah, formatDate } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { Header } from "~/components/layout/header";
import { EmptyState } from "~/components/shared/empty-state";
import {
  useWeeklyReport,
  useMonthlyReport,
  useYearlyReport,
} from "~/modules/reports/hooks";
import {
  CategoryBreakdown,
  WalletBreakdown,
} from "~/modules/reports/components";
import type { ReportResponse } from "~/modules/reports/types";

const CategoryPieChart = lazy(() =>
  import("~/modules/reports/components/pie-chart").then((m) => ({
    default: m.CategoryPieChart,
  })),
);

type Period = "weekly" | "monthly" | "yearly";

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [dateOffset, setDateOffset] = useState(0);

  const targetDate = getTargetDate(period, dateOffset);

  const weekly = useWeeklyReport(
    period === "weekly" ? targetDate : undefined,
  );
  const monthly = useMonthlyReport(
    period === "monthly" ? targetDate : undefined,
  );
  const yearly = useYearlyReport(
    period === "yearly" ? targetDate : undefined,
  );

  const current =
    period === "weekly" ? weekly : period === "monthly" ? monthly : yearly;

  const report = current.data;

  return (
    <section>
      <Header title="Laporan" />
      <main className="p-4 pb-24 md:pb-4 space-y-4">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              { value: "weekly", label: "Mingguan" },
              { value: "monthly", label: "Bulanan" },
              { value: "yearly", label: "Tahunan" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setPeriod(tab.value);
                setDateOffset(0);
              }}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                period === tab.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDateOffset((o) => o - 1)}
            aria-label="Periode sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground">
            {getPeriodLabel(period, dateOffset)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDateOffset((o) => o + 1)}
            disabled={dateOffset >= 0}
            aria-label="Periode berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {current.isLoading ? (
          <ReportSkeleton />
        ) : current.isError ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="font-medium text-foreground">Gagal memuat laporan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {current.error?.message ?? "Terjadi kesalahan"}
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => current.refetch()}
              >
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        ) : report ? (
          <ReportContent report={report} period={period} />
        ) : (
          <EmptyState
            icon={BarChart3}
            message="Belum ada data"
            description="Laporan akan muncul setelah ada transaksi di periode ini"
          />
        )}
      </main>
    </section>
  );
}

function ReportContent({
  report,
  period,
}: {
  report: ReportResponse;
  period: Period;
}) {
  const { isVisible } = useSaldoVisibility();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Pemasukan"
          value={report.totalIncome}
          isVisible={isVisible}
          color="text-success"
        />
        <SummaryCard
          label="Pengeluaran"
          value={report.totalExpense}
          isVisible={isVisible}
          color="text-destructive"
        />
        <SummaryCard
          label={report.balance >= 0 ? "Surplus" : "Defisit"}
          value={Math.abs(report.balance)}
          isVisible={isVisible}
          color={report.balance >= 0 ? "text-success" : "text-destructive"}
        />
      </div>

      {period === "monthly" && report.comparison && (
        <div className="flex gap-3">
          <ComparisonBadge
            label="Pemasukan"
            change={report.comparison.incomeChange}
          />
          <ComparisonBadge
            label="Pengeluaran"
            change={report.comparison.expenseChange}
          />
        </div>
      )}

      {report.categoryBreakdown.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
            Pengeluaran per Kategori
          </h3>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
            <CategoryPieChart data={report.categoryBreakdown} />
          </Suspense>
          </CardContent>
        </Card>
      )}

      {report.categoryBreakdown.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <CategoryBreakdown data={report.categoryBreakdown} />
          </CardContent>
        </Card>
      )}

      {report.walletBreakdown.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <WalletBreakdown data={report.walletBreakdown} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  isVisible,
  color,
}: {
  label: string;
  value: number;
  isVisible: boolean;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-sm font-bold tabular-nums", color)}>
          {isVisible ? formatRupiah(value) : "••••"}
        </p>
      </CardContent>
    </Card>
  );
}

function ComparisonBadge({
  label,
  change,
}: {
  label: string;
  change: number;
}) {
  const isUp = change > 0;
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium",
        isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      )}
    >
      {isUp ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {label} {isUp ? "+" : ""}
      {change.toFixed(1)}% vs bulan lalu
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function getTargetDate(period: Period, offset: number): string {
  const now = new Date();
  if (period === "weekly") {
    now.setDate(now.getDate() + offset * 7);
  } else if (period === "monthly") {
    now.setMonth(now.getMonth() + offset);
  } else {
    now.setFullYear(now.getFullYear() + offset);
  }
  return now.toISOString().split("T")[0]!;
}

function getPeriodLabel(period: Period, offset: number): string {
  const now = new Date();
  if (period === "weekly") {
    now.setDate(now.getDate() + offset * 7);
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${formatDate(start, { day: "numeric", month: "short" })} - ${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`;
  } else if (period === "monthly") {
    now.setMonth(now.getMonth() + offset);
    return formatDate(now, { month: "long", year: "numeric" });
  } else {
    now.setFullYear(now.getFullYear() + offset);
    return String(now.getFullYear());
  }
}
