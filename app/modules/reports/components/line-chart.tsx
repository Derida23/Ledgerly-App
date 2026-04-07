import { lazy, Suspense } from "react";
import type { MonthlyTrendDto } from "~/modules/reports/types";

const RechartsLineChart = lazy(() => import("./line-chart-inner"));

interface TrendLineChartProps {
  data: MonthlyTrendDto[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <Suspense
      fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}
    >
      <RechartsLineChart data={data} />
    </Suspense>
  );
}
