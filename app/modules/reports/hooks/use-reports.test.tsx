import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData, useWeeklyReport, useMonthlyReport, useYearlyReport } from "./use-reports";
import { createWrapper } from "../../../../tests/helpers";

describe("useDashboardData", () => {
  it("fetches dashboard, budgets, and due-today in parallel", async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.dashboard?.totalBalance).toBe(4950000);
    expect(result.current.budgets).toHaveLength(1);
    expect(result.current.dueToday).toHaveLength(1);
  });
});

describe("useWeeklyReport", () => {
  it("fetches weekly report", async () => {
    const { result } = renderHook(() => useWeeklyReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.period).toBe("weekly");
  });
});

describe("useMonthlyReport", () => {
  it("fetches monthly report", async () => {
    const { result } = renderHook(() => useMonthlyReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.period).toBe("monthly");
    expect(result.current.data?.comparison).toBeDefined();
  });

  it("accepts date parameter", async () => {
    const { result } = renderHook(() => useMonthlyReport("2026-04-01"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useYearlyReport", () => {
  it("fetches yearly report", async () => {
    const { result } = renderHook(() => useYearlyReport(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.period).toBe("yearly");
  });
});
