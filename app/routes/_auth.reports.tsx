import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatRupiah, formatDate } from "~/lib/utils";
import { useSaldoVisibility } from "~/lib/saldo-visibility";
import { Header } from "~/components/layout/header";
import {
  useWeeklyReport,
  useMonthlyReport,
  useYearlyReport,
} from "~/modules/reports/hooks";
import {
  CategoryPieChart,
  CategoryBreakdown,
  WalletBreakdown,
  TrendLineChart,
} from "~/modules/reports/components";
import type { ReportResponse } from "~/modules/reports/types";

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
      <main className="p-4 pb-20 md:pb-4 space-y-4">
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
          <button
            onClick={() => setDateOffset((o) => o - 1)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
            aria-label="Periode sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {getPeriodLabel(period, dateOffset)}
          </span>
          <button
            onClick={() => setDateOffset((o) => o + 1)}
            disabled={dateOffset >= 0}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent disabled:opacity-30"
            aria-label="Periode berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {current.isLoading ? (
          <ReportSkeleton />
        ) : current.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="font-medium">Gagal memuat laporan</p>
            <button
              onClick={() => current.refetch()}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Coba Lagi
            </button>
          </div>
        ) : report ? (
          <ReportContent report={report} period={period} />
        ) : null}
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
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Pengeluaran per Kategori
          </h3>
          <CategoryPieChart data={report.categoryBreakdown} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <CategoryBreakdown data={report.categoryBreakdown} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <WalletBreakdown data={report.walletBreakdown} />
      </div>
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
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm font-bold", color)}>
        {isVisible ? formatRupiah(value) : "••••"}
      </p>
    </div>
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
