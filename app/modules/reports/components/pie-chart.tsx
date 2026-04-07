import { lazy, Suspense } from "react";
import type { CategoryBreakdownDto } from "~/modules/reports/types";

const RechartsPieChart = lazy(() => import("./pie-chart-inner"));

interface CategoryPieChartProps {
  data: CategoryBreakdownDto[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <Suspense
      fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}
    >
      <RechartsPieChart data={data} />
    </Suspense>
  );
}
