import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getDashboard,
  getWeeklyReport,
  getMonthlyReport,
  getYearlyReport,
  reportKeys,
} from "~/modules/reports/api";
import { budgetKeys } from "~/modules/budgets/api/keys";
import { recurringKeys } from "~/modules/recurrings/api/keys";
import { getBudgets } from "~/modules/budgets/api";
import { getDueToday } from "~/modules/recurrings/api";

const REPORT_STALE = 10 * 60 * 1000;

export function useDashboardData() {
  const results = useQueries({
    queries: [
      {
        queryKey: reportKeys.dashboard(),
        queryFn: getDashboard,
        staleTime: REPORT_STALE,
      },
      {
        queryKey: budgetKeys.list(),
        queryFn: getBudgets,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: recurringKeys.dueToday(),
        queryFn: getDueToday,
        staleTime: 60 * 60 * 1000,
      },
    ],
  });

  const [dashboard, budgets, dueToday] = results;

  return {
    dashboard: dashboard?.data,
    budgets: budgets?.data,
    dueToday: dueToday?.data,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
}

export function useWeeklyReport(date?: string) {
  return useQuery({
    queryKey: reportKeys.weekly(date),
    queryFn: () => getWeeklyReport(date),
    staleTime: REPORT_STALE,
  });
}

export function useMonthlyReport(date?: string) {
  return useQuery({
    queryKey: reportKeys.monthly(date),
    queryFn: () => getMonthlyReport(date),
    staleTime: REPORT_STALE,
  });
}

export function useYearlyReport(date?: string) {
  return useQuery({
    queryKey: reportKeys.yearly(date),
    queryFn: () => getYearlyReport(date),
    staleTime: REPORT_STALE,
  });
}
