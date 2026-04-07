import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "~/lib/utils";
import type { MonthlyTrendDto } from "~/modules/reports/types";

interface LineChartInnerProps {
  data: MonthlyTrendDto[];
}

export default function LineChartInner({ data }: LineChartInnerProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            stroke="var(--color-muted-foreground)"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
          />
          <Tooltip
            formatter={(value: number) => formatRupiah(value)}
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
          <Line
            type="monotone"
            dataKey="income"
            name="Pemasukan"
            stroke="var(--color-success)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Pengeluaran"
            stroke="var(--color-destructive)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${months[Number(m) - 1]} ${year?.slice(2)}`;
}
