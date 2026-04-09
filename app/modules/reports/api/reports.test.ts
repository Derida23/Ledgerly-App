import { describe, it, expect } from "vitest";
import { getDashboard, getWeeklyReport, getMonthlyReport, getYearlyReport } from "./reports";

describe("reports API", () => {
  it("getDashboard returns dashboard data", async () => {
    const data = await getDashboard();
    expect(data.totalBalance).toBe(4950000);
    expect(data.wallets).toHaveLength(2);
    expect(data.monthlyTrend).toHaveLength(2);
  });

  it("getWeeklyReport returns report", async () => {
    const report = await getWeeklyReport();
    expect(report.period).toBe("weekly");
    expect(report.totalIncome).toBeDefined();
    expect(report.categoryBreakdown).toBeDefined();
  });

  it("getMonthlyReport returns report", async () => {
    const report = await getMonthlyReport();
    expect(report.period).toBe("monthly");
    expect(report.comparison).toBeDefined();
  });

  it("getYearlyReport returns report", async () => {
    const report = await getYearlyReport();
    expect(report.period).toBe("yearly");
  });

  it("getMonthlyReport accepts date parameter", async () => {
    const report = await getMonthlyReport("2026-04-01");
    expect(report).toBeDefined();
  });
});
