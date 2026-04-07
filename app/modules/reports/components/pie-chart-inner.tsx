import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "~/lib/utils";
import type { CategoryBreakdownDto } from "~/modules/reports/types";

const COLORS = [
  "#4a7c59", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f",
  "#264653", "#e76f51", "#2a9d8f", "#e9c46a", "#f4a261",
];

interface PieChartInnerProps {
  data: CategoryBreakdownDto[];
}

export default function PieChartInner({ data }: PieChartInnerProps) {
  if (!data.length) return null;

  const chartData = data.map((d) => ({
    name: `${d.categoryIcon} ${d.categoryName}`,
    value: d.total,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatRupiah(value)}
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
